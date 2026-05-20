import pandas as pd

def calculate_match(s1, s2):
    """
    核心算法：计算 s1 (当前用户) 与 s2 (目标对象) 的匹配分数
    """
    if str(s1['subject_id']).strip().upper() != str(s2['subject_id']).strip().upper():
        return 0, []

    score = 0
    reasons = []
    
    i1, i2 = s1['intent'], s2['intent']
    f1, f2 = s1['fee_pref'], s2['fee_pref']

    is_study_buddy_pair = False
    
    if i1 == 'Provider' and i2 == 'Provider':
        return 0, []
        
    elif i1 == 'Receiver' and i2 == 'Receiver':
        if f1 == 'Free Only' and f2 == 'Free Only':
            is_study_buddy_pair = True
            score += 35
            reasons.append("📚 Study Buddy Match: Both seeking peers! (+35)")
        else:
            return 0, []
    else:
        receiver_fee = f1 if i1 == 'Receiver' else f2
        provider_fee = f1 if i1 == 'Provider' else f2
        if receiver_fee == 'Free Only' and provider_fee == 'Paid Only':
            return 0, []
        elif receiver_fee == 'Free Only' and provider_fee == 'Free Only':
            score += 20
            reasons.append("🌱 Voluntarism Match: Free connection! (+20)")
        elif receiver_fee == 'Paid Only':
            score += 15
            reasons.append("💰 Premium Match: Paid connection! (+15)")
            if provider_fee == 'Paid Only':
                score += 10
                reasons.append("🤝 Premium Deal: Matched with Paid Tutor (+10)")

    s1_adv = [x.strip().lower() for x in str(s1['advantage']).split(",") if x.strip()]
    s1_weak = [x.strip().lower() for x in str(s1['weakness']).split(",") if x.strip()]
    s2_adv = [x.strip().lower() for x in str(s2['advantage']).split(",") if x.strip()]
    s2_weak = [x.strip().lower() for x in str(s2['weakness']).split(",") if x.strip()]
    
    def check_complementary(adv_list, weak_list):
        for adv in adv_list:
            for weak in weak_list:
                if adv in weak or weak in adv: return True
        return False

    is_complementary = (i1 == 'Provider' and check_complementary(s1_adv, s2_weak)) or \
                       (i2 == 'Provider' and check_complementary(s2_adv, s1_weak))

    has_shared_strength = any(a1 in a2 or a2 in a1 for a1 in s1_adv for a2 in s2_adv)

    if is_study_buddy_pair:
        if has_shared_strength:
            score += 20
            reasons.append("🤝 Buddy Synergy: Shared strengths (+20)")
    else:
        if is_complementary and has_shared_strength:
            score += 55
            reasons.append("⚡ Ultimate Match: Academic Synergy + Complementary (+55)")
        elif is_complementary:
            score += 45
            reasons.append("✓ Complementary Match: Skill rescue connection (+45)")
        elif has_shared_strength:
            score += 25
            reasons.append("🤝 Shared Stack: Overlapping expertise (+25)")
        else:
            score -= 10
            reasons.append("⚠ Skill Gap: No intersection observed (-10)")

    # 时间匹配逻辑 (简略版)
    s1_time = str(s1['time_slots']).upper()
    s2_time = str(s2['time_slots']).upper()
    if s1_time == s2_time:
        score += 15
        reasons.append("✓ Time Match: Exact overlap (+15)")

    # 评分历史
    rating = float(s2.get('rating', 3.0))
    if rating >= 4.5:
        score += 10
        reasons.append(f"★ Top-Rated Peer ({rating}/5.0) (+10)")
    elif rating < 3.0:
        score -= 15
        reasons.append(f"⚠ Low Peer Rating ({rating}/5.0) (-15)")

    return max(0, min(score, 100)), reasons

def get_match_results(user_input, database_df):
    """
    给队友的API接口
    user_input: 网页端收集的字典
    database_df: 数据库中的全部候选人 DataFrame
    """
    results = []
    for _, row in database_df.iterrows():
        score, reasons = calculate_match(user_input, row.to_dict())
        results.append({
            'name': row['name'],
            'contact': row.get('contact', 'N/A'),
            'score': int(score),
            'reasons': reasons
        })
    # 按分数降序排列返回
    return sorted(results, key=lambda x: x['score'], reverse=True)