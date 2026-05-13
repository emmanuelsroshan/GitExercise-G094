def calculate_match(s1, s2):
    date_score = 25 if s1['date'] == s2['date'] else 0
    time_score = 25 if s1['time'] == s2['time'] else 0
    subject_score = 25 if s1['subject_id'] == s2['subject_id'] else 0
    skill_score = 25 if (s1['adv'] == s2['weak'] or s1['weak'] == s2['adv']) else 0

    return date_score + time_score + subject_score + skill_score


# TEMP database (later replace with Member 2)
students_db = [
    {'name': 'Student B', 'subject_id': 'CMT1134', 'date': 'Monday', 'time': 'Morning', 'adv': 'Math', 'weak': 'Python'},
    {'name': 'Student C', 'subject_id': 'CMT1134', 'date': 'Friday', 'time': 'Evening', 'adv': 'Art', 'weak': 'Music'}
]