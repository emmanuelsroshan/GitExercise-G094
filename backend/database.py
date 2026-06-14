import sqlite3
import json
from contextlib import contextmanager

DB_PATH = "backend/studyconnect.db"


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def row_to_dict(row):
    return dict(row) if row else None


def rows_to_list(rows):
    return [dict(r) for r in rows]


# ─── Schema ────────────────────────────────────────────────────────────────────

def init_db():
    with get_db() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            username       TEXT    NOT NULL,
            email          TEXT    UNIQUE NOT NULL,
            password_hash  TEXT    NOT NULL,
            role           TEXT    DEFAULT 'student',
            is_active      INTEGER DEFAULT 1,
            created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS profiles (
            user_id        INTEGER PRIMARY KEY,
            university     TEXT    DEFAULT '',
            course         TEXT    DEFAULT '',
            year           TEXT    DEFAULT '1st Year',
            bio            TEXT    DEFAULT '',
            subjects       TEXT    DEFAULT '[]',
            schedule       TEXT    DEFAULT '{}',
            strengths      TEXT    DEFAULT '',
            learning_style TEXT    DEFAULT '',
            rate           REAL    DEFAULT 0,
            experience     TEXT    DEFAULT '',
            max_students   INTEGER DEFAULT 5,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS help_requests (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER NOT NULL,
            tutor_id    INTEGER NOT NULL,
            subject     TEXT    NOT NULL,
            topic       TEXT    NOT NULL,
            description TEXT    DEFAULT '',
            type        TEXT    DEFAULT 'General Learning',
            urgency     TEXT    DEFAULT 'Medium',
            status      TEXT    DEFAULT 'Open',
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (tutor_id)   REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id   INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            content     TEXT    NOT NULL,
            is_read     INTEGER DEFAULT 0,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id)   REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            reviewer_id  INTEGER NOT NULL,
            reviewee_id  INTEGER NOT NULL,
            rating       REAL    NOT NULL,
            comment      TEXT    DEFAULT '',
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (reviewer_id) REFERENCES users(id),
            FOREIGN KEY (reviewee_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER NOT NULL,
            tutor_id    INTEGER NOT NULL,
            request_id  INTEGER,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (tutor_id)   REFERENCES users(id)
        );
        """)


# ─── Users ─────────────────────────────────────────────────────────────────────

def create_user(username, email, password_hash, role="student"):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (?,?,?,?)",
            (username, email, password_hash, role),
        )
        uid = cur.lastrowid
        conn.execute("INSERT OR IGNORE INTO profiles (user_id) VALUES (?)", (uid,))
        return uid


def get_user_by_id(user_id):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id=?", (int(user_id),)).fetchone()
        return row_to_dict(row)


def get_user_by_email(email):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        return row_to_dict(row)


def get_all_users():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT u.*, p.university, p.course FROM users u LEFT JOIN profiles p ON u.id=p.user_id ORDER BY u.created_at DESC"
        ).fetchall()
        return rows_to_list(rows)


def admin_update_user(user_id, data):
    with get_db() as conn:
        if "is_active" in data:
            conn.execute("UPDATE users SET is_active=? WHERE id=?", (data["is_active"], user_id))
        if "role" in data:
            conn.execute("UPDATE users SET role=? WHERE id=?", (data["role"], user_id))


def delete_user(user_id):
    with get_db() as conn:
        conn.execute("DELETE FROM users WHERE id=?", (user_id,))


# ─── Profiles ──────────────────────────────────────────────────────────────────

def _parse_profile(p):
    if not p:
        return None
    p["subjects"] = json.loads(p.get("subjects") or "[]")
    p["schedule"] = json.loads(p.get("schedule") or "{}")
    return p


def get_profile(user_id):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM profiles WHERE user_id=?", (int(user_id),)).fetchone()
        return _parse_profile(row_to_dict(row))


def save_or_update_profile(user_id, data):
    uid = int(user_id)
    subjects = json.dumps(data.get("subjects", []))
    schedule = json.dumps(data.get("schedule", {}))
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO profiles
              (user_id,university,course,year,bio,subjects,schedule,strengths,learning_style,rate,experience,max_students)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(user_id) DO UPDATE SET
              university=excluded.university, course=excluded.course, year=excluded.year,
              bio=excluded.bio, subjects=excluded.subjects, schedule=excluded.schedule,
              strengths=excluded.strengths, learning_style=excluded.learning_style,
              rate=excluded.rate, experience=excluded.experience, max_students=excluded.max_students
            """,
            (
                uid,
                data.get("university", ""),
                data.get("course", ""),
                data.get("year", "1st Year"),
                data.get("bio", ""),
                subjects,
                schedule,
                data.get("strengths", ""),
                data.get("learning_style", ""),
                data.get("rate", 0),
                data.get("experience", ""),
                data.get("max_students", 5),
            ),
        )
        if "username" in data:
            conn.execute("UPDATE users SET username=? WHERE id=?", (data["username"], uid))


def search_users(subject=None, tutor_type=None, university=None, exclude_id=None):
    query = """
        SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at,
               p.university, p.course, p.year, p.bio, p.subjects, p.schedule,
               p.rate, p.strengths, p.learning_style, p.experience
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.is_active=1 AND u.role IN ('volunteer','paid')
    """
    params = []
    if exclude_id:
        query += " AND u.id != ?"
        params.append(int(exclude_id))
    if tutor_type and tutor_type not in ("all", "All"):
        query += " AND u.role = ?"
        params.append(tutor_type)
    if university:
        query += " AND LOWER(p.university) LIKE ?"
        params.append(f"%{university.lower()}%")

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()

    results = []
    for row in rows:
        d = row_to_dict(row)
        subs = json.loads(d.get("subjects") or "[]")
        if subject and subject not in ("All", "") and subject not in subs:
            continue
        d["subjects"] = subs
        d["schedule"] = json.loads(d.get("schedule") or "{}")
        results.append(d)
    return results


# ─── Help Requests ─────────────────────────────────────────────────────────────

def create_help_request(student_id, tutor_id, subject, topic, description, req_type, urgency):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO help_requests (student_id,tutor_id,subject,topic,description,type,urgency) VALUES (?,?,?,?,?,?,?)",
            (student_id, tutor_id, subject, topic, description, req_type, urgency),
        )
        return cur.lastrowid


def get_requests_by_student(student_id):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT r.*, u.username AS tutor_name
               FROM help_requests r JOIN users u ON r.tutor_id=u.id
               WHERE r.student_id=? ORDER BY r.created_at DESC""",
            (int(student_id),),
        ).fetchall()
        return rows_to_list(rows)


def get_requests_for_tutor(tutor_id):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT r.*, u.username AS student_name
               FROM help_requests r JOIN users u ON r.student_id=u.id
               WHERE r.tutor_id=? ORDER BY r.created_at DESC""",
            (int(tutor_id),),
        ).fetchall()
        return rows_to_list(rows)


def update_request_status(req_id, status):
    with get_db() as conn:
        conn.execute("UPDATE help_requests SET status=? WHERE id=?", (status, req_id))
        if status == "Completed":
            row = conn.execute("SELECT * FROM help_requests WHERE id=?", (req_id,)).fetchone()
            if row:
                conn.execute(
                    "INSERT INTO sessions (student_id,tutor_id,request_id) VALUES (?,?,?)",
                    (row["student_id"], row["tutor_id"], req_id),
                )


# ─── Messages ──────────────────────────────────────────────────────────────────

def send_message(sender_id, receiver_id, content):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO messages (sender_id,receiver_id,content) VALUES (?,?,?)",
            (int(sender_id), int(receiver_id), content),
        )
        return cur.lastrowid


def get_messages(user1_id, user2_id):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT m.*, u.username AS sender_name
               FROM messages m JOIN users u ON m.sender_id=u.id
               WHERE (m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?)
               ORDER BY m.created_at ASC""",
            (int(user1_id), int(user2_id), int(user2_id), int(user1_id)),
        ).fetchall()
        return rows_to_list(rows)


def mark_read(sender_id, receiver_id):
    with get_db() as conn:
        conn.execute(
            "UPDATE messages SET is_read=1 WHERE sender_id=? AND receiver_id=?",
            (int(sender_id), int(receiver_id)),
        )


def get_unread_count(user_id):
    with get_db() as conn:
        row = conn.execute(
            "SELECT COUNT(*) AS c FROM messages WHERE receiver_id=? AND is_read=0",
            (int(user_id),),
        ).fetchone()
        return row["c"] if row else 0


def get_conversations(user_id):
    uid = int(user_id)
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT
              CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END AS other_id,
              u.username AS other_name,
              u.role AS other_role,
              (SELECT content FROM messages m2
               WHERE (m2.sender_id=? AND m2.receiver_id= CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END)
                  OR (m2.sender_id= CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END AND m2.receiver_id=?)
               ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
              (SELECT COUNT(*) FROM messages m3
               WHERE m3.sender_id= CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END
                 AND m3.receiver_id=? AND m3.is_read=0) AS unread_count
            FROM messages m
            JOIN users u ON u.id = CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END
            WHERE m.sender_id=? OR m.receiver_id=?
            GROUP BY other_id
            ORDER BY MAX(m.created_at) DESC
            """,
            (uid, uid, uid, uid, uid, uid, uid, uid, uid, uid),
        ).fetchall()
        return rows_to_list(rows)


# ─── Reviews ───────────────────────────────────────────────────────────────────

def create_review(reviewer_id, reviewee_id, rating, comment):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO reviews (reviewer_id,reviewee_id,rating,comment) VALUES (?,?,?,?)",
            (int(reviewer_id), int(reviewee_id), float(rating), comment),
        )
        return cur.lastrowid


def get_reviews_for_user(user_id):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT r.*, u.username AS reviewer_name
               FROM reviews r JOIN users u ON r.reviewer_id=u.id
               WHERE r.reviewee_id=? ORDER BY r.created_at DESC""",
            (int(user_id),),
        ).fetchall()
        return rows_to_list(rows)


def get_avg_rating(user_id):
    reviews = get_reviews_for_user(user_id)
    if not reviews:
        return None
    return round(sum(r["rating"] for r in reviews) / len(reviews), 2)


# ─── Platform Stats ────────────────────────────────────────────────────────────

def get_platform_stats():
    with get_db() as conn:
        total_users   = conn.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
        active_tutors = conn.execute(
            "SELECT COUNT(*) AS c FROM users WHERE role IN ('volunteer','paid') AND is_active=1"
        ).fetchone()["c"]
        total_sessions= conn.execute("SELECT COUNT(*) AS c FROM sessions").fetchone()["c"]
        total_msgs    = conn.execute("SELECT COUNT(*) AS c FROM messages").fetchone()["c"]
        avg_row       = conn.execute("SELECT AVG(rating) AS r FROM reviews").fetchone()
        avg_rating    = round(float(avg_row["r"]), 2) if avg_row["r"] else 0.0
        open_requests = conn.execute(
            "SELECT COUNT(*) AS c FROM help_requests WHERE status='Open'"
        ).fetchone()["c"]
    return {
        "total_users":   total_users,
        "active_tutors": active_tutors,
        "total_sessions":total_sessions,
        "total_messages":total_msgs,
        "avg_rating":    avg_rating,
        "open_requests": open_requests,
    }
