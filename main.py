from matching import get_match_results
from database import get_users, create_table
import pandas as pd
import tkinter as tk
from tkinter import ttk
from database import save_user



# =========================
# MAIN APP CLASS
# =========================
class StudyGroupApp(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("MMU StudyGroup Matchmaker")
        self.geometry("700x500")

        # Container for pages
        container = tk.Frame(self)
        container.pack(fill="both", expand=True)

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

        self.configure(bg="#f5f5f5")

        tk.Label(
            self,
            text="Welcome Back",
            font=("Arial", 22, "bold"),
            bg="#f5f5f5"
        ).pack(pady=20)

        tk.Label(self, text="Student ID", bg="#f5f5f5").pack()
        self.username = tk.Entry(self, width=30)
        self.username.pack(pady=5)

        tk.Label(self, text="Password", bg="#f5f5f5").pack()
        self.password = tk.Entry(self, show="*", width=30)
        self.password.pack(pady=5)

        tk.Button(
            self,
            text="Login",
            command=lambda: controller.show_frame(ProfilePage),
            bg="#4CAF50",
            fg="white",
            font=("Arial", 11, "bold"),
            width=12
        ).pack(pady=15)



# =========================
# PROFILE PAGE
# =========================
class ProfilePage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)

        self.configure(bg="#f5f5f5")

        tk.Label(
            self,
            text="Profile Setup",
            font=("Arial", 22, "bold"),
            bg="#f5f5f5"
        ).pack(pady=20)

        tk.Label(self, text="Name", bg="#f5f5f5").pack()
        self.name = tk.Entry(self, width=30)
        self.name.pack(pady=5)

        tk.Label(self, text="Subject", bg="#f5f5f5").pack()
        self.subject = tk.Entry(self, width=30)
        self.subject.pack(pady=5)

        tk.Label(self, text="Availability (e.g. Mon 2-4)", bg="#f5f5f5").pack()
        self.availability = tk.Entry(self, width=30)
        self.availability.pack(pady=5)

        tk.Label(self, text="Skill Level", bg="#f5f5f5").pack()
        self.skill = ttk.Combobox(self, values=["Beginner", "Intermediate", "Advanced"])
        self.skill.pack(pady=5)

        tk.Button(
            self,
            text="Continue",
            command=lambda: controller.show_frame(SearchPage),
            bg="#4CAF50",
            fg="white",
            font=("Arial", 11, "bold"),
            width=12
        ).pack(pady=15)



# =========================
# SEARCH PAGE
# =========================
class SearchPage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)

        self.controller = controller

        self.configure(bg="#f5f5f5")

        tk.Label(
            self,
            text="Find Your Study Partner",
            font=("Arial", 24, "bold"),
            bg="#f5f5f5",
            fg="#333"
        ).pack(pady=15)

        tk.Label(
            self,
            text="Match with the best partner based on your skills",
            font=("Arial", 10),
            bg="#f5f5f5",
            fg="gray"
        ).pack(pady=5)

        # INPUT FIELDS
        tk.Label(self, text="Subject ID", bg="#f5f5f5").pack()
        self.subject = tk.Entry(self, width=30)
        self.subject.pack(pady=5)

        tk.Label(self, text="Time (e.g. MON_14)", bg="#f5f5f5").pack()
        self.time = tk.Entry(self, width=30)
        self.time.pack(pady=5)

        tk.Label(self, text="Your Strength", bg="#f5f5f5").pack()
        self.adv = tk.Entry(self, width=30)
        self.adv.pack(pady=5)

        tk.Label(self, text="Your Weakness", bg="#f5f5f5").pack()
        self.weak = tk.Entry(self, width=30)
        self.weak.pack(pady=5)

        tk.Button(
            self,
            text="Find Match",
            command=self.show_results,
            bg="#4CAF50",
            fg="white",
            font=("Arial", 12, "bold"),
            width=15
        ).pack(pady=15)

        self.result_label = tk.Label(
            self,
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

    def show_results(self):
        user_data = {
            'subject_id': self.subject.get(),
            'time_slots': self.time.get(),
            'advantage': self.adv.get(),
            'weakness': self.weak.get()
        }

        users_list = get_users()
        users_df = pd.DataFrame(users_list)

        results = get_match_results(user_data, users_df)

        output = "Top Study Matches:\n\n"

        for r in results:
            output += f"• {r['name']}  ({r['score']}%)\n"

            for reason in r['reasons']:
                output += f"   - {reason}\n"

            output += "\n"

        self.result_label.config(text=output)



# =========================
# RUN APP
# =========================
from database import save_user

if __name__ == "__main__":
    create_table()  
    app = StudyGroupApp()
    app.mainloop()
