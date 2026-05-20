import tkinter as tk
from tkinter import ttk
from tkinter import filedialog
from tkinter import messagebox
import os
import pandas as pd

uploaded_result_path = ""
uploaded_photo_path = ""

def calculate_match(s1, s2):
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
            reasons.append("📚 Study Buddy Match: Both seeking peers to discuss & tackle assignments together! (+35)")
        else:
            return 0, []
            
    else:
        receiver_fee = f1 if i1 == 'Receiver' else f2
        provider_fee = f1 if i1 == 'Provider' else f2
        
        if receiver_fee == 'Free Only' and provider_fee == 'Paid Only':
            return 0, []
            
        elif receiver_fee == 'Free Only' and provider_fee == 'Free Only':
            score += 20
            reasons.append("🌱 Voluntarism Match: An amazing free learning connection between a Volunteer and an eager Learner! (+20)")
            
        elif receiver_fee == 'Paid Only':
            score += 15
            reasons.append("💰 Premium Match: Paid Receiver successfully unlocked this learning connection (+15)")
            if provider_fee == 'Paid Only':
                score += 10
                reasons.append("🤝 Premium Deal: Matched with a Professional Paid Tutor (+10)")

    s1_adv = [x.strip().lower() for x in str(s1['advantage']).split(",") if x.strip()]
    s1_weak = [x.strip().lower() for x in str(s1['weakness']).split(",") if x.strip()]
    s2_adv = [x.strip().lower() for x in str(s2['advantage']).split(",") if x.strip()]
    s2_weak = [x.strip().lower() for x in str(s2['weakness']).split(",") if x.strip()]
    
    def check_complementary(adv_list, weak_list):
        for adv in adv_list:
            for weak in weak_list:
                if adv in weak or weak in adv: return True
        return False

    is_complementary = False
    if i1 == 'Provider' and check_complementary(s1_adv, s2_weak): is_complementary = True
    elif i2 == 'Provider' and check_complementary(s2_adv, s1_weak): is_complementary = True

    has_shared_strength = False
    for adv1 in s1_adv:
        for adv2 in s2_adv:
            if adv1 in adv2 or adv2 in adv1:
                has_shared_strength = True
                break

    # 技能权重细算
    if is_study_buddy_pair:
        if has_shared_strength:
            score += 20
            reasons.append("🤝 Buddy Synergy: Shared technical strengths to brainstorm together (+20)")
    else:
        # 师生模式下的技能分
        if is_complementary and has_shared_strength:
            score += 55
            reasons.append("⚡ Ultimate Match: Perfect Academic Synergy + Skill Complementary (+55)")
        elif is_complementary:
            score += 45
            reasons.append("✓ Complementary Match: Great skill-to-weakness rescue connection (+45)")
        elif has_shared_strength:
            score += 25
            reasons.append("🤝 Shared Stack: Overlapping expertise fields (+25)")
        else:
            score -= 10
            reasons.append("⚠ Skill Gap: No strong skill intersection observed (-10)")

    # 时间槽规范化匹配
    s1_hours = [h.strip().upper().replace(" ", "").replace("DAY_", "") for h in str(s1['time_slots']).split(",") if h.strip()]
    s2_hours = [h.strip().upper().replace(" ", "").replace("DAY_", "") for h in str(s2['time_slots']).split(",") if h.strip()]
    
    normalized_s1 = [h.replace("MONDAY", "MON").replace("TUESDAY", "TUE").replace("WEDNESDAY", "WED").replace("THURSDAY", "THU").replace("FRIDAY", "FRI") for h in s1_hours]
    normalized_s2 = [h.replace("MONDAY", "MON").replace("TUESDAY", "TUE").replace("WEDNESDAY", "WED").replace("THURSDAY", "THU").replace("FRIDAY", "FRI") for h in s2_hours]

    exact_overlap = list(set(normalized_s1) & set(normalized_s2))
    
    if len(exact_overlap) >= 1:
        score += 15
        reasons.append(f"✓ Time Match: Exact overlapping hours found ({', '.join(exact_overlap)}) (+15)")
    else:
        fuzzy_match_found = False
        matched_day = ""
        for h1 in normalized_s1:
            for h2 in normalized_s2:
                if "_" in h1 and "_" in h2:
                    parts1 = h1.split("_")
                    parts2 = h2.split("_")
                    if len(parts1) == 2 and len(parts2) == 2:
                        if parts1[0] == parts2[0]:
                            try:
                                if abs(int(parts1[1]) - int(parts2[1])) <= 2:
                                    fuzzy_match_found = True
                                    matched_day = parts1[0]
                                    break
                            except ValueError: pass
            if fuzzy_match_found: break
        if fuzzy_match_found: 
            score += 5
            reasons.append(f"✓ Flexible Time: Nearby hours on {matched_day} (+5)")
        else:
            score -= 20
            reasons.append("❌ Schedule Clash: Completely different available days/hours (-20)")

    # 软性习惯细节匹配
    fields = ['frequency', 'study_mode', 'group_size', 'grade_goal', 'study_style', 'resource_pref', 'language']
    matched_fields = []
    for field in fields:
        if str(s1[field]).strip().lower() == str(s2[field]).strip().lower(): 
            score += 2
            matched_fields.append(field.replace("_", " ").title())
    if matched_fields:
        reasons.append(f"✓ Shared Habits ({', '.join(matched_fields)}) (+{len(matched_fields)*2})")

    # 身份匹配
    if s1['role'] == 'Student (Peer)' and s2['role'] == 'Student (Peer)': score += 5
    elif s1['role'] == 'Alumni (Mentor)' and s2['role'] == 'Alumni (Mentor)': score += 5

    # 评分历史检查
    user_rating = float(s2.get('rating', 3.0))
    if user_rating >= 4.5:
        score += 10
        reasons.append(f"★ Top-Rated Peer Bonus ({user_rating}/5.0) (+10)")
    elif user_rating < 3.0:
        score -= 15
        reasons.append(f"⚠ Low Peer Rating Warning ({user_rating}/5.0) (-15)")

    final_score = max(0, min(score, 100))
    return final_score, reasons

mock_raw_data = [
    {
        'name': 'Tutor Bryan (High Score Demo)', 'contact': 'bryan@mmu.edu.my', 'intent': 'Provider', 'role': 'Alumni (Mentor)', 'fee_pref': 'Free Only', 
        'subject_id': 'CMT1134', 'time_slots': 'MON_14', 'frequency': 'Weekly', 'advantage': 'Python, Coding, Data', 
        'weakness': 'None', 'study_mode': 'On-Campus', 'group_size': 'Group', 'grade_goal': 'Aiming A', 
        'study_style': 'Discussion', 'resource_pref': 'Past Years', 'language': 'Malay', 'rating': 4.9
    },
    {
        'name': 'Sarah Lin (Medium Score Demo)', 'contact': 'sarah.l@mmu.edu.my', 'intent': 'Provider', 'role': 'Student (Peer)', 'fee_pref': 'Free Only', 
        'subject_id': 'CMT1134', 'time_slots': 'MON_13', 'frequency': 'Weekly', 'advantage': 'Discrete Math, Python', 
        'weakness': 'Web Dev', 'study_mode': 'Online', 'group_size': '1-on-1', 'grade_goal': 'Aiming A', 
        'study_style': 'Quiet', 'resource_pref': 'Past Years', 'language': 'Malay', 'rating': 3.8
    },
    {
        'name': 'John Doe (Low Score Demo)', 'contact': 'john.doe@mmu.edu.my', 'intent': 'Receiver', 'role': 'Student (Peer)', 'fee_pref': 'Free Only', 
        'subject_id': 'CMT1134', 'time_slots': 'FRI_10', 'frequency': 'Daily', 'advantage': 'HTML', 
        'weakness': 'Java', 'study_mode': 'Online', 'group_size': '1-on-1', 'grade_goal': 'Just Pass', 
        'study_style': 'Quiet', 'resource_pref': 'Lecture Slides', 'language': 'English', 'rating': 2.1
    }
]
students_df = pd.DataFrame(mock_raw_data)

def upload_result():
    global uploaded_result_path
    file_path = filedialog.askopenfilename(title="Select Past Year Result", filetypes=[("Image/PDF Files", "*.png *.jpg *.jpeg *.pdf")])
    if file_path:
        uploaded_result_path = file_path
        lbl_result_status.config(text=f"✓ Loaded: {os.path.basename(file_path)}", fg="green")

def upload_photo():
    global uploaded_photo_path
    file_path = filedialog.askopenfilename(title="Select Profile Photo", filetypes=[("Image Files", "*.png *.jpg *.jpeg")])
    if file_path:
        uploaded_photo_path = file_path
        lbl_photo_status.config(text=f"✓ Loaded: {os.path.basename(file_path)}", fg="green")

def go_to_page_1():
    frame_page2.pack_forget()
    frame_page1.pack(pady=50, padx=20, fill="both", expand=True)

def go_to_page_2():
    global uploaded_result_path, uploaded_photo_path
    frame_page1.pack_forget()
    frame_page2.pack(pady=5, padx=10, fill="both", expand=True)
    
    choice = combo_intent.get()
    frame_commercial_block.pack_forget()
    
    if "Offering Paid" in choice:
        combo_fee.set("Paid Only")
        frame_commercial_block.pack(fill="x", pady=5, before=entry_sub_label)
    else:
        combo_fee.set("Free Only")
        uploaded_result_path = ""
        uploaded_photo_path = ""
        lbl_result_status.config(text="No File Selected", fg="red")
        lbl_photo_status.config(text="No Photo Selected", fg="red")

def run_match():
    choice = combo_intent.get()
    if "Offering Paid" in choice and not uploaded_result_path:
        output_text.delete(1.0, tk.END)
        output_text.insert(tk.END, "ERROR: Paid Tutors must upload Past Year Results.")
        return

    user_data = {
        'role': combo_role.get(), 'intent': "Receiver" if "Receiver" in choice else "Provider",
        'fee_pref': "Paid Only" if "Offering Paid" in choice else "Free Only", 'subject_id': entry_sub.get(),
        'time_slots': entry_time.get(), 'frequency': combo_freq.get(), 'advantage': entry_adv.get(),
        'weakness': entry_weak.get(), 'study_mode': combo_mode.get(), 'group_size': combo_size.get(),
        'grade_goal': combo_grade.get(), 'study_style': combo_style.get(), 'resource_pref': combo_resource.get(),
        'language': combo_lang.get()
    }
    
    match_results = []
    for idx, row in students_df.iterrows():
        target_dict = row.to_dict()
        score, reasons = calculate_match(user_data, target_dict)
        match_results.append({'target': target_dict, 'score': score, 'reasons': reasons})
        
    match_results.sort(key=lambda x: x['score'], reverse=True)
    
    output_text.delete(1.0, tk.END)
    output_text.insert(tk.END, "====== MMU Smart Matchmaking Dashboard ======\n\n")

    for res in match_results:
        t = res['target']
        output_text.insert(tk.END, f"▶ {t['name']} [{int(res['score'])}% Match]\n")
        # --- 新增展示行 ---
        output_text.insert(tk.END, f" ☎ Contact: {t.get('contact', 'N/A')}\n") 
        output_text.insert(tk.END, f" ★ Star Rating: {t.get('rating', 'N/A')}/5.0\n")
        for reason in res['reasons']:
            output_text.insert(tk.END, f"    {reason}\n")
        output_text.insert(tk.END, "-"*45 + "\n")
        
    messagebox.showinfo("Success", f"Match complete! Evaluated {len(students_df)} potential matches.")

def export_batch_report():
    try:
        choice = combo_intent.get()
        user_data = {
            'role': combo_role.get(), 'intent': "Receiver" if "Receiver" in choice else "Provider",
            'fee_pref': "Paid Only" if "Offering Paid" in choice else "Free Only", 'subject_id': entry_sub.get(),
            'time_slots': entry_time.get(), 'frequency': combo_freq.get(), 'advantage': entry_adv.get(),
            'weakness': entry_weak.get(), 'study_mode': combo_mode.get(), 'group_size': combo_size.get(),
            'grade_goal': combo_grade.get(), 'study_style': combo_style.get(), 'resource_pref': combo_resource.get(),
            'language': combo_lang.get()
        }
        
        report_df = students_df.copy()
        
        real_scores = []
        for idx, row in report_df.iterrows():
            score, _ = calculate_match(user_data, row.to_dict())
            real_scores.append(int(score))
            
        report_df['Calculated_Match_Score'] = real_scores
        
        # --- 核心改动：使用 sort_values 进行降序排列 ---
        report_df = report_df.sort_values(by='Calculated_Match_Score', ascending=False)
        
        save_path = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV Files", "*.csv")])
        if save_path:
            report_df.to_csv(save_path, index=False)
            messagebox.showinfo("Export Success", f"报告已生成，匹配度最高的排在最前面。\n保存路径: {save_path}")
    except Exception as e:
        messagebox.showerror("Error", f"Failed to export: {str(e)}")

# GUI 布局组装
root = tk.Tk()
root.title("MMU Expert & Peer Matcher")
root.geometry("480x980")

frame_page1 = tk.Frame(root)
frame_page1.pack(pady=50, padx=20, fill="both", expand=True)

tk.Label(frame_page1, text="Welcome to MMU Study Matcher", font=("Arial", 14, "bold")).pack(pady=20)
tk.Label(frame_page1, text="Step 1: Choose Your Precise Objective", font=("Arial", 10, "italic")).pack(pady=5)

tk.Label(frame_page1, text="Identify Your Status:").pack(anchor="w", pady=5)
combo_role = ttk.Combobox(frame_page1, values=["Student (Peer)", "Alumni (Mentor)"], state="readonly")
combo_role.pack(fill="x", pady=5); combo_role.current(0)

tk.Label(frame_page1, text="Identify Your Objective:").pack(anchor="w", pady=5)
combo_intent = ttk.Combobox(frame_page1, values=[
    "Receiver (Looking for Help)", "Provider (Volunteering for Free)", "Provider (Offering Paid Tuition)"
], state="readonly")
combo_intent.pack(fill="x", pady=5); combo_intent.current(0)

btn_next = tk.Button(frame_page1, text="Continue to Details →", command=go_to_page_2, bg="green", fg="white", font=("Arial", 11, "bold"))
btn_next.pack(pady=30, fill="x")

frame_page2 = tk.Frame(root)
btn_back = tk.Button(frame_page2, text="← Back to Objectives", command=go_to_page_1, fg="gray")
btn_back.pack(anchor="w", pady=5)

frame_commercial_block = tk.Frame(frame_page2)
tk.Label(frame_commercial_block, text="Tutorial Fee Preference:").pack(anchor="w")
combo_fee = ttk.Combobox(frame_commercial_block, values=["Free Only", "Paid Only", "Flexible"], state="readonly")
combo_fee.pack(fill="x", pady=1)

upload_btn_frame = tk.Frame(frame_commercial_block); upload_btn_frame.pack(fill="x")
btn_upload_res = tk.Button(upload_btn_frame, text="Upload Result", command=upload_result); btn_upload_res.pack(side="left", padx=2)
lbl_result_status = tk.Label(upload_btn_frame, text="No File Selected", fg="red"); lbl_result_status.pack(side="left", padx=5)

upload_photo_frame = tk.Frame(frame_commercial_block); upload_photo_frame.pack(fill="x", pady=2)
btn_upload_pho = tk.Button(upload_photo_frame, text="Upload Photo", command=upload_photo); btn_upload_pho.pack(side="left", padx=2)
lbl_photo_status = tk.Label(upload_photo_frame, text="No Photo Selected", fg="red"); lbl_photo_status.pack(side="left", padx=5)

def create_label_entry(text, default_val, hint_text=None):
    global entry_sub_label
    label = tk.Label(frame_page2, text=text)
    label.pack(anchor="w")
    if hint_text:
        tk.Label(frame_page2, text=hint_text, font=("Arial", 8, "italic"), fg="gray").pack(anchor="w")
    entry = tk.Entry(frame_page2)
    entry.pack(fill="x", pady=1)
    entry.insert(0, default_val)
    return label, entry

def create_label_combo(text, values):
    tk.Label(frame_page2, text=text).pack(anchor="w")
    combo = ttk.Combobox(frame_page2, values=values, state="readonly")
    combo.pack(fill="x", pady=1)
    combo.current(0)
    return combo

entry_sub_label, entry_sub = create_label_entry("Subject ID:", "CMT1134")
entry_time_label, entry_time = create_label_entry("Time Slots:", "MON_14", hint_text="Format: DAY_HOUR")
combo_freq = create_label_combo("Meeting Frequency:", ["Weekly", "Daily"])
entry_adv_label, entry_adv = create_label_entry("Your Strengths:", "python")
entry_weak_label, entry_weak = create_label_entry("Your Weaknesses:", "Discrete Math")
combo_mode = create_label_combo("Study Mode:", ["On-Campus", "Online"])
combo_size = create_label_combo("Group Size Preference:", ["Group", "1-on-1"])
combo_grade = create_label_combo("Target Grade Goal:", ["Aiming A", "Just Pass"])
combo_style = create_label_combo("Study Style:", ["Discussion", "Quiet"])
combo_resource = create_label_combo("Learning Resource:", ["Past Years", "Lecture Slides"])
combo_lang = create_label_combo("Preferred Language:", ["Malay", "English", "Mandarin"])

btn_frame = tk.Frame(frame_page2)
btn_frame.pack(pady=10, fill="x")

btn_match = tk.Button(btn_frame, text="Verify and Match", command=run_match, bg="darkblue", fg="white", font=("Arial", 10, "bold"))
btn_match.pack(side="left", fill="x", expand=True, padx=2)

btn_export = tk.Button(btn_frame, text="Pandas Export CSV", command=export_batch_report, bg="purple", fg="white", font=("Arial", 10, "bold"))
btn_export.pack(side="left", fill="x", expand=True, padx=2)

output_scroll = tk.Scrollbar(frame_page2)
output_scroll.pack(side="right", fill="y")
output_text = tk.Text(frame_page2, height=8, width=50, yscrollcommand=output_scroll.set, font=("Courier", 9))
output_text.pack(fill="both", expand=True)
output_scroll.config(command=output_text.yview)

root.mainloop()