"""
Matching algorithm – weights per StudyConnect spec:
  Subject compatibility  40 %
  Schedule compatibility 35 %
  University similarity  10 %
  Tutor rating           15 %
"""

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def compute_match(my_profile, tutor_profile, avg_rating=None):
    """
    Return a dict with total score (0-100) and per-factor breakdown + reason strings.
    """
    empty = {"total": 0, "subject": 0, "schedule": 0, "university": 0, "rating": 0, "reasons": []}
    if not my_profile or not tutor_profile:
        return empty

    reasons = []

    # ── Subject Match (40%) ─────────────────────────────────────────────────────
    my_subs     = my_profile.get("subjects") or []
    tutor_subs  = tutor_profile.get("subjects") or []
    if my_subs and tutor_subs:
        overlap = [s for s in my_subs if s in tutor_subs]
        subject_score = len(overlap) / len(my_subs) * 100
        if overlap:
            shown = overlap[:3]
            reasons.append(f"✓ Teaches: {', '.join(shown)}" + (" & more" if len(overlap) > 3 else ""))
    else:
        subject_score = 0

    # ── Schedule Compatibility (35%) ────────────────────────────────────────────
    my_sched    = my_profile.get("schedule") or {}
    tutor_sched = tutor_profile.get("schedule") or {}
    my_slots    = sum(len(my_sched.get(d, [])) for d in DAYS)
    overlap_slots = sum(
        len([h for h in my_sched.get(d, []) if h in tutor_sched.get(d, [])])
        for d in DAYS
    )
    if my_slots > 0:
        schedule_score = overlap_slots / my_slots * 100
        if overlap_slots > 0:
            reasons.append(f"✓ {overlap_slots} overlapping time slot{'s' if overlap_slots > 1 else ''}")
    else:
        schedule_score = 50  # neutral when student has no schedule set

    # ── University Similarity (10%) ─────────────────────────────────────────────
    my_uni    = (my_profile.get("university") or "").strip().lower()
    tutor_uni = (tutor_profile.get("university") or "").strip().lower()
    if my_uni and tutor_uni and my_uni == tutor_uni:
        uni_score = 100
        reasons.append("✓ Same university")
    else:
        uni_score = 0

    # ── Tutor Rating (15%) ──────────────────────────────────────────────────────
    if avg_rating is not None:
        rating_score = (avg_rating / 5) * 100
        if avg_rating >= 4.5:
            reasons.append(f"★ Top-rated ({avg_rating:.1f} / 5.0)")
        elif avg_rating >= 4.0:
            reasons.append(f"★ Highly rated ({avg_rating:.1f} / 5.0)")
    else:
        rating_score = 60  # neutral default for new (unrated) tutors

    total = round(
        0.40 * subject_score
        + 0.35 * schedule_score
        + 0.10 * uni_score
        + 0.15 * rating_score
    )

    return {
        "total":      min(total, 100),
        "subject":    round(subject_score),
        "schedule":   round(schedule_score),
        "university": round(uni_score),
        "rating":     round(rating_score),
        "reasons":    reasons,
    }
