"""
Pandas-powered analytics for the StudyConnect admin dashboard.
"""

import json
import sqlite3

DB_PATH = "backend/studyconnect.db"


def _query(sql, params=()):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(sql, params).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_analytics():
    try:
        import pandas as pd
    except ImportError:
        return _fallback_analytics()

    # ── Load raw data ───────────────────────────────────────────────────────────
    users    = _query("SELECT * FROM users")
    profiles = _query("SELECT * FROM profiles")
    reviews  = _query("SELECT * FROM reviews")
    sessions = _query("SELECT * FROM sessions")
    requests = _query("SELECT * FROM help_requests")

    if not users:
        return {"message": "No data yet"}

    df_users    = pd.DataFrame(users)
    df_profiles = pd.DataFrame(profiles) if profiles else pd.DataFrame()
    df_reviews  = pd.DataFrame(reviews)  if reviews  else pd.DataFrame()
    df_sessions = pd.DataFrame(sessions) if sessions else pd.DataFrame()
    df_requests = pd.DataFrame(requests) if requests else pd.DataFrame()

    # ── Subject demand ──────────────────────────────────────────────────────────
    subject_counts = {}
    for p in profiles:
        subs = json.loads(p.get("subjects") or "[]")
        for s in subs:
            subject_counts[s] = subject_counts.get(s, 0) + 1
    subject_demand = sorted(
        [{"subject": k, "count": v} for k, v in subject_counts.items()],
        key=lambda x: x["count"],
        reverse=True,
    )

    # ── Role distribution ───────────────────────────────────────────────────────
    role_dist = df_users["role"].value_counts().to_dict()

    # ── Tutor performance ───────────────────────────────────────────────────────
    tutor_perf = []
    if not df_reviews.empty and not df_users.empty:
        avg_by_tutor = (
            df_reviews.groupby("reviewee_id")["rating"]
            .agg(["mean", "count"])
            .reset_index()
            .rename(columns={"mean": "avg_rating", "count": "review_count"})
        )
        merged = avg_by_tutor.merge(
            df_users[["id", "username"]].rename(columns={"id": "reviewee_id"}),
            on="reviewee_id",
            how="left",
        )
        merged["avg_rating"] = merged["avg_rating"].round(2)
        tutor_perf = merged.sort_values("avg_rating", ascending=False).head(10).to_dict("records")

    # ── Registration trend (last 7 days) ────────────────────────────────────────
    reg_trend = []
    if not df_users.empty:
        df_users["created_at"] = pd.to_datetime(df_users["created_at"], errors="coerce")
        daily = (
            df_users.groupby(df_users["created_at"].dt.date)
            .size()
            .reset_index(name="count")
            .tail(7)
        )
        reg_trend = [{"date": str(r["created_at"]), "count": int(r["count"])} for _, r in daily.iterrows()]

    # ── Request status breakdown ────────────────────────────────────────────────
    req_status = {}
    if not df_requests.empty:
        req_status = df_requests["status"].value_counts().to_dict()

    return {
        "subject_demand":     subject_demand,
        "role_distribution":  role_dist,
        "tutor_performance":  tutor_perf,
        "registration_trend": reg_trend,
        "request_status":     req_status,
    }


def _fallback_analytics():
    """Simple dict-based analytics when pandas is unavailable."""
    subjects_raw = _query("SELECT subjects FROM profiles")
    subject_counts = {}
    for row in subjects_raw:
        for s in json.loads(row.get("subjects") or "[]"):
            subject_counts[s] = subject_counts.get(s, 0) + 1

    roles = _query("SELECT role, COUNT(*) AS c FROM users GROUP BY role")
    return {
        "subject_demand":    sorted(
            [{"subject": k, "count": v} for k, v in subject_counts.items()],
            key=lambda x: x["count"], reverse=True,
        ),
        "role_distribution": {r["role"]: r["c"] for r in roles},
        "tutor_performance": [],
        "registration_trend":[],
        "request_status":   {},
    }
