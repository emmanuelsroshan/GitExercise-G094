from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

from database import (
    init_db,
    create_user, get_user_by_id, get_user_by_email, get_all_users,
    admin_update_user, delete_user,
    get_profile, save_or_update_profile, search_users,
    create_help_request, get_requests_by_student, get_requests_for_tutor,
    update_request_status,
    send_message, get_messages, mark_read, get_unread_count, get_conversations,
    create_review, get_reviews_for_user, get_avg_rating,
    get_platform_stats,
)
from matching import compute_match
from analytics import get_analytics

# ─── App setup ─────────────────────────────────────────────────────────────────

app = Flask(__name__)
app.config["JWT_SECRET_KEY"]          = "studyconnect-super-secret-change-in-prod"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(days=7)

CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
jwt = JWTManager(app)

# ─── Helpers ───────────────────────────────────────────────────────────────────

def safe_user(u):
    """Strip password hash before returning to client."""
    if u:
        u = dict(u)
        u.pop("password_hash", None)
    return u


def require_admin():
    uid  = get_jwt_identity()
    user = get_user_by_id(uid)
    if not user or user["role"] != "admin":
        return None, (jsonify({"error": "Admin only"}), 403)
    return user, None


# ═══════════════════════════════════════════════════════════════════════════════
#  AUTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    username = (data.get("username") or "").strip()
    email    = (data.get("email")    or "").strip().lower()
    password = data.get("password", "")
    role     = data.get("role", "student")

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if get_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409

    uid   = create_user(username, email, generate_password_hash(password), role)
    token = create_access_token(identity=str(uid))
    user  = safe_user(get_user_by_id(uid))
    return jsonify({"token": token, "user": user}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.json or {}
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password", "")

    user = get_user_by_email(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401
    if not user["is_active"]:
        return jsonify({"error": "Account suspended – contact admin"}), 403

    token = create_access_token(identity=str(user["id"]))
    return jsonify({"token": token, "user": safe_user(user)})


# ═══════════════════════════════════════════════════════════════════════════════
#  PROFILE
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/profile", methods=["GET"])
@jwt_required()
def get_own_profile():
    uid     = get_jwt_identity()
    user    = safe_user(get_user_by_id(uid))
    profile = get_profile(uid)
    return jsonify({"user": user, "profile": profile})


@app.route("/api/profile", methods=["PUT"])
@jwt_required()
def update_own_profile():
    uid  = get_jwt_identity()
    data = request.json or {}
    save_or_update_profile(uid, data)
    return jsonify({"profile": get_profile(uid), "user": safe_user(get_user_by_id(uid))})


@app.route("/api/users/<int:target_id>", methods=["GET"])
@jwt_required()
def get_user_profile(target_id):
    user = safe_user(get_user_by_id(target_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    profile  = get_profile(target_id)
    reviews  = get_reviews_for_user(target_id)
    avg      = get_avg_rating(target_id)
    sessions = 0  # placeholder
    return jsonify({"user": user, "profile": profile, "reviews": reviews, "avg_rating": avg, "session_count": sessions})


# ═══════════════════════════════════════════════════════════════════════════════
#  SEARCH & MATCH
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/search", methods=["GET"])
@jwt_required()
def search():
    uid        = get_jwt_identity()
    subject    = request.args.get("subject", "")
    tutor_type = request.args.get("type", "all")
    university = request.args.get("university", "")
    min_rating = request.args.get("min_rating", type=float)

    my_profile = get_profile(uid)
    tutors     = search_users(subject=subject, tutor_type=tutor_type,
                              university=university, exclude_id=uid)

    results = []
    for t in tutors:
        tid         = t["id"]
        t_profile   = get_profile(tid)
        reviews     = get_reviews_for_user(tid)
        avg         = get_avg_rating(tid)

        if min_rating is not None and (avg is None or avg < min_rating):
            continue

        score = compute_match(my_profile, t_profile, avg)
        results.append({
            "user":         safe_user(t),
            "profile":      t_profile,
            "avg_rating":   avg,
            "review_count": len(reviews),
            "score":        score,
        })

    results.sort(key=lambda x: x["score"]["total"], reverse=True)
    return jsonify(results)


@app.route("/api/match/<int:target_id>", methods=["GET"])
@jwt_required()
def match_score(target_id):
    uid        = get_jwt_identity()
    my_profile = get_profile(uid)
    t_profile  = get_profile(target_id)
    avg        = get_avg_rating(target_id)
    return jsonify(compute_match(my_profile, t_profile, avg))


# ═══════════════════════════════════════════════════════════════════════════════
#  HELP REQUESTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/requests", methods=["GET"])
@jwt_required()
def list_requests():
    uid  = get_jwt_identity()
    user = get_user_by_id(uid)
    if not user:
        return jsonify([])
    if user["role"] == "student":
        return jsonify(get_requests_by_student(uid))
    return jsonify(get_requests_for_tutor(uid))


@app.route("/api/requests", methods=["POST"])
@jwt_required()
def make_request():
    uid  = get_jwt_identity()
    data = request.json or {}
    rid  = create_help_request(
        student_id  = uid,
        tutor_id    = data["tutor_id"],
        subject     = data.get("subject", ""),
        topic       = data.get("topic", ""),
        description = data.get("description", ""),
        req_type    = data.get("type", "General Learning"),
        urgency     = data.get("urgency", "Medium"),
    )
    return jsonify({"id": rid, "message": "Request sent"}), 201


@app.route("/api/requests/<int:rid>", methods=["PUT"])
@jwt_required()
def update_request(rid):
    data   = request.json or {}
    status = data.get("status", "")
    if status not in ("Open", "Accepted", "Completed", "Cancelled"):
        return jsonify({"error": "Invalid status"}), 400
    update_request_status(rid, status)
    return jsonify({"message": "Updated"})


# ═══════════════════════════════════════════════════════════════════════════════
#  MESSAGES
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/messages/conversations", methods=["GET"])
@jwt_required()
def conversations():
    uid = get_jwt_identity()
    return jsonify(get_conversations(uid))


@app.route("/api/messages/unread", methods=["GET"])
@jwt_required()
def unread():
    uid = get_jwt_identity()
    return jsonify({"count": get_unread_count(uid)})


@app.route("/api/messages/<int:other_id>", methods=["GET"])
@jwt_required()
def get_thread(other_id):
    uid  = get_jwt_identity()
    msgs = get_messages(uid, other_id)
    mark_read(other_id, uid)          # mark their messages to me as read
    return jsonify(msgs)


@app.route("/api/messages/<int:other_id>", methods=["POST"])
@jwt_required()
def post_message(other_id):
    uid     = get_jwt_identity()
    content = (request.json or {}).get("content", "").strip()
    if not content:
        return jsonify({"error": "Empty message"}), 400
    mid = send_message(uid, other_id, content)
    return jsonify({"id": mid}), 201


# ═══════════════════════════════════════════════════════════════════════════════
#  REVIEWS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/reviews", methods=["POST"])
@jwt_required()
def add_review():
    uid  = get_jwt_identity()
    data = request.json or {}
    rid  = create_review(
        reviewer_id  = uid,
        reviewee_id  = data["reviewee_id"],
        rating       = data.get("rating", 5),
        comment      = data.get("comment", ""),
    )
    return jsonify({"id": rid}), 201


@app.route("/api/reviews/<int:uid>", methods=["GET"])
def get_reviews(uid):
    reviews = get_reviews_for_user(uid)
    avg     = get_avg_rating(uid)
    return jsonify({"reviews": reviews, "avg_rating": avg})


# ═══════════════════════════════════════════════════════════════════════════════
#  ADMIN
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/admin/users", methods=["GET"])
@jwt_required()
def admin_users():
    _, err = require_admin()
    if err:
        return err
    users = get_all_users()
    for u in users:
        u.pop("password_hash", None)
    return jsonify(users)


@app.route("/api/admin/users/<int:target_id>", methods=["PUT"])
@jwt_required()
def admin_edit_user(target_id):
    _, err = require_admin()
    if err:
        return err
    admin_update_user(target_id, request.json or {})
    return jsonify({"message": "Updated"})


@app.route("/api/admin/users/<int:target_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_user(target_id):
    _, err = require_admin()
    if err:
        return err
    delete_user(target_id)
    return jsonify({"message": "Deleted"})


@app.route("/api/admin/stats", methods=["GET"])
@jwt_required()
def admin_stats():
    _, err = require_admin()
    if err:
        return err
    return jsonify(get_platform_stats())


# ═══════════════════════════════════════════════════════════════════════════════
#  ANALYTICS (public-ish)
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/analytics", methods=["GET"])
@jwt_required()
def analytics():
    _, err = require_admin()
    if err:
        return err
    return jsonify(get_analytics())


# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
