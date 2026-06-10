from matching import get_match_results
from database import get_users, create_table, get_user_by_name, save_or_update_user
import pandas as pd
import tkinter as tk
from tkinter import ttk, messagebox


# =========================
# MAIN APP CLASS
# =========================
class StudyGroupApp(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("MMU StudyGroup Matchmaker")
        self.geometry("700x500")

        # stores currently logged-in user
        self.current_user_name = ""

        # Container for pages
        container = tk.Frame(self)
        container.pack(fill="both", expand=True)

        container.grid_rowconfigure(0, weight=1)
        container.grid_columnconfigure(0, weight=1)

        self.frames = {}

        # Initialize pages
        for F in (LoginPage, ProfilePage, SearchPage):
            frame = F(parent=container, controller=self)
            self.frames[F] = frame
            frame.grid(row=0, column=0, sticky="nsew")

        self.show_frame(LoginPage)

    def show_frame(self, page):
        frame = self.frames[page]
        frame.tkraise()


# =========================
# LOGIN PAGE
# =========================
class LoginPage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)

        self.controller = controller
        self.configure(bg="#f5f5f5")

        main_frame = tk.Frame(self, bg="#f5f5f5")
        main_frame.place(relx=0.5, rely=0.5, anchor="center")

        tk.Label(
            main_frame,
            text="Welcome Back",
            font=("Arial", 22, "bold"),
            bg="#f5f5f5"
        ).pack(pady=20)

        tk.Label(main_frame, text="Student Name", bg="#f5f5f5").pack()
        self.username = tk.Entry(main_frame, width=30)
        self.username.pack(pady=5)

        tk.Label(main_frame, text="Password", bg="#f5f5f5").pack()
        self.password = tk.Entry(main_frame, show="*", width=30)
        self.password.pack(pady=5)

        tk.Button(
            main_frame,
            text="Login",
            command=self.login_user,
            bg="#4CAF50",
            fg="white",
            font=("Arial", 11, "bold"),
            width=12
        ).pack(pady=15)

    def login_user(self):
        name = self.username.get().strip()

        if name == "":
            messagebox.showwarning("Missing Name", "Please enter your name before logging in.")
            return

        self.controller.current_user_name = name

        profile_page = self.controller.frames[ProfilePage]
        profile_page.load_profile()

        self.controller.show_frame(ProfilePage)


# =========================
# PROFILE PAGE
# =========================
class ProfilePage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)

        self.controller = controller
        self.configure(bg="#f5f5f5")

        main_frame = tk.Frame(self, bg="#f5f5f5")
        main_frame.place(relx=0.5, rely=0.5, anchor="center")

        tk.Label(
            main_frame,
            text="Profile Details",
            font=("Arial", 22, "bold"),
            bg="#f5f5f5"
        ).pack(pady=15)

        tk.Label(main_frame, text="Name", bg="#f5f5f5").pack()
        self.name = tk.Entry(main_frame, width=30)
        self.name.pack(pady=5)

        tk.Label(main_frame, text="Subject ID", bg="#f5f5f5").pack()
        self.subject = tk.Entry(main_frame, width=30)
        self.subject.pack(pady=5)

        tk.Label(main_frame, text="Time Slot (e.g. MON_14)", bg="#f5f5f5").pack()
        self.time_slots = tk.Entry(main_frame, width=30)
        self.time_slots.pack(pady=5)

        tk.Label(main_frame, text="Your Strength", bg="#f5f5f5").pack()
        self.advantage = tk.Entry(main_frame, width=30)
        self.advantage.pack(pady=5)

        tk.Label(main_frame, text="Your Weakness", bg="#f5f5f5").pack()
        self.weakness = tk.Entry(main_frame, width=30)
        self.weakness.pack(pady=5)

        tk.Button(
            main_frame,
            text="Save / Update Profile",
            command=self.save_profile,
            bg="#4CAF50",
            fg="white",
            font=("Arial", 11, "bold"),
            width=20
        ).pack(pady=10)

        self.profile_display = tk.Label(
            main_frame,
            text="",
            bg="#ffffff",
            fg="#000000",
            justify="left",
            width=50,
            height=6,
            bd=1,
            relief="solid",
            anchor="nw"
        )
        self.profile_display.pack(pady=10)

        tk.Button(
            main_frame,
            text="Continue to Search",
            command=self.go_to_search,
            bg="#4CAF50",
            fg="white",
            font=("Arial", 11, "bold"),
            width=20
        ).pack(pady=10)

    def load_profile(self):
        name = self.controller.current_user_name
        user = get_user_by_name(name)

        self.name.delete(0, tk.END)
        self.subject.delete(0, tk.END)
        self.time_slots.delete(0, tk.END)
        self.advantage.delete(0, tk.END)
        self.weakness.delete(0, tk.END)

        self.name.insert(0, name)

        if user:
            self.subject.insert(0, user["subject_id"])
            self.time_slots.insert(0, user["time_slots"])
            self.advantage.insert(0, user["advantage"])
            self.weakness.insert(0, user["weakness"])

            self.profile_display.config(
                text=f"Current Profile:\n"
                     f"Name: {user['name']}\n"
                     f"Subject: {user['subject_id']}\n"
                     f"Time Slot: {user['time_slots']}\n"
                     f"Strength: {user['advantage']}\n"
                     f"Weakness: {user['weakness']}"
            )
        else:
            self.profile_display.config(
                text="No profile found yet.\n"
                     "Please enter your details and click Save / Update Profile."
            )

    def save_profile(self):
        name = self.name.get().strip()
        subject = self.subject.get().strip()
        time_slots = self.time_slots.get().strip()
        advantage = self.advantage.get().strip()
        weakness = self.weakness.get().strip()

        if name == "" or subject == "" or time_slots == "" or advantage == "" or weakness == "":
            messagebox.showwarning(
                "Incomplete Profile",
                "Please fill in all profile fields before saving."
            )
            return

        save_or_update_user(name, subject, time_slots, advantage, weakness)

        self.controller.current_user_name = name

        self.profile_display.config(
            text=f"Updated Profile:\n"
                 f"Name: {name}\n"
                 f"Subject: {subject}\n"
                 f"Time Slot: {time_slots}\n"
                 f"Strength: {advantage}\n"
                 f"Weakness: {weakness}"
        )

        messagebox.showinfo("Profile Saved", "Profile saved / updated successfully.")

    def go_to_search(self):
        search_page = self.controller.frames[SearchPage]
        search_page.load_from_profile()

        self.controller.show_frame(SearchPage)


# =========================
# SEARCH PAGE
# =========================
class SearchPage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)

        self.controller = controller
        self.configure(bg="#f5f5f5")

        main_frame = tk.Frame(self, bg="#f5f5f5")
        main_frame.place(relx=0.5, rely=0.45, anchor="center")

        tk.Label(
            main_frame,
            text="Find Your Study Partner",
            font=("Arial", 24, "bold"),
            bg="#f5f5f5",
            fg="#333"
        ).pack(pady=15)

        tk.Label(
            main_frame,
            text="Match with the best partner based on your skills",
            font=("Arial", 10),
            bg="#f5f5f5",
            fg="gray"
        ).pack(pady=5)

        tk.Label(main_frame, text="Subject ID", bg="#f5f5f5").pack()
        self.subject = tk.Entry(main_frame, width=30)
        self.subject.pack(pady=5)

        tk.Label(main_frame, text="Time (e.g. MON_14)", bg="#f5f5f5").pack()
        self.time = tk.Entry(main_frame, width=30)
        self.time.pack(pady=5)

        tk.Label(main_frame, text="Your Strength", bg="#f5f5f5").pack()
        self.adv = tk.Entry(main_frame, width=30)
        self.adv.pack(pady=5)

        tk.Label(main_frame, text="Your Weakness", bg="#f5f5f5").pack()
        self.weak = tk.Entry(main_frame, width=30)
        self.weak.pack(pady=5)

        tk.Button(
            main_frame,
            text="Find Match",
            command=self.show_results,
            bg="#4CAF50",
            fg="white",
            font=("Arial", 12, "bold"),
            width=15
        ).pack(pady=10)

        tk.Button(
            main_frame,
            text="Clear Results",
            command=lambda: self.result_label.config(text=""),
            bg="#999999",
            fg="white",
            font=("Arial", 10, "bold"),
            width=15
        ).pack(pady=5)

        tk.Button(
            main_frame,
            text="Back to Profile",
            command=lambda: controller.show_frame(ProfilePage),
            bg="#777777",
            fg="white",
            font=("Arial", 10, "bold"),
            width=15
        ).pack(pady=5)

        self.result_label = tk.Label(
            main_frame,
            text="",
            justify="left",
            bg="#ffffff",
            fg="#000000",
            width=60,
            height=12,
            bd=1,
            relief="solid",
            anchor="nw"
        )
        self.result_label.pack(pady=10)

    def load_from_profile(self):
        name = self.controller.current_user_name
        user = get_user_by_name(name)

        if user:
            self.subject.delete(0, tk.END)
            self.time.delete(0, tk.END)
            self.adv.delete(0, tk.END)
            self.weak.delete(0, tk.END)

            self.subject.insert(0, user["subject_id"])
            self.time.insert(0, user["time_slots"])
            self.adv.insert(0, user["advantage"])
            self.weak.insert(0, user["weakness"])

    def show_results(self):
        self.result_label.config(text="Finding matches...")
        self.update_idletasks()
        subject = self.subject.get().strip().upper()
        time_slots = self.time.get().strip().upper()
        advantage = self.adv.get().strip()
        weakness = self.weak.get().strip()
        

        if subject == "" or time_slots == "" or advantage == "" or weakness == "":
            messagebox.showwarning(
                "Incomplete Search",
                "Please fill in all search fields before finding a match."
            )
            return

        user_data = {
            'subject_id': subject,
            'time_slots': time_slots,
            'advantage': advantage,
            'weakness': weakness
        }

        users_list = get_users()

        if len(users_list) == 0:
            self.result_label.config(
                text="No users found in database.\nPlease create or update a profile first."
            )
            return

        users_df = pd.DataFrame(users_list)

        results = get_match_results(user_data, users_df)

        results = [r for r in results if r['name'] != self.controller.current_user_name]

        if len(results) == 0:
            self.result_label.config(
                text="No suitable matches found.\nTry changing your subject or time."
            )
            return

        results = results[:3]

        output = f"Found {len(results)} matches\n\n"

        for index, r in enumerate(results):
            if index == 0:
                output += "⭐ Best Match\n"

            output += f"• {r['name']} ({r['score']}%)\n"

            for reason in r['reasons']:
                output += f"   - {reason}\n"

            output += "\n"

        self.result_label.config(text=output)


# =========================
# RUN APP
# =========================
if __name__ == "__main__":
    create_table()
    app = StudyGroupApp()
    app.mainloop()