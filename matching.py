import pandas as pd

def calculate_match(s1, s2):
    if str(s1['subject_id']).strip().upper() != str(s2['subject_id']).strip().upper():
        return 0, []

    score = 0
    reasons = []

    # simple matching (we keep it simple first)
    if s1['time_slots'] == s2['time_slots']:
        score += 20
        reasons.append("Same time slot")

    if s1['advantage'].lower() in s2['weakness'].lower():
        score += 30
        reasons.append("Your strength helps their weakness")

    if s2.get('rating', 3) >= 4.5:
        score += 10
        reasons.append("High rated student")

    return score, reasons


def get_match_results(user_input, database_df):
    results = []

    for _, row in database_df.iterrows():
        score, reasons = calculate_match(user_input, row.to_dict())

        results.append({
            'name': row['name'],
            'score': score,
            'reasons': reasons
        })

    return sorted(results, key=lambda x: x['score'], reverse=True)


# TEMP DATA (later replace with Member 2)
data = [
    {
        'name': 'Student B',
        'subject_id': 'CMT1134',
        'time_slots': 'MON_14',
        'advantage': 'Math',
        'weakness': 'Python',
        'rating': 4.5
    },
    {
        'name': 'Student C',
        'subject_id': 'CMT1134',
        'time_slots': 'FRI_10',
        'advantage': 'Art',
        'weakness': 'Music',
        'rating': 3.0
    }
]

students_df = pd.DataFrame(data)
