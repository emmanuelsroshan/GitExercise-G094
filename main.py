from matching import calculate_match, students_db
import tkinter as tk
from tkinter import ttk

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
        self.controller = controller

        tk.Label(self, text="Login", font=("Arial", 20)).pack(pady=20)

        tk.Label(self, text="Student ID").pack()
        self.username = tk.Entry(self)
        self.username.pack()

        tk.Label(self, text="Password").pack()
        self.password = tk.Entry(self, show="*")
        self.password.pack()

        tk.Button(self, text="Login",
                  command=lambda: controller.show_frame(ProfilePage)
                  ).pack(pady=10)


# =========================
# PROFILE PAGE
# =========================
class ProfilePage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller

        tk.Label(self, text="Profile Setup", font=("Arial", 20)).pack(pady=20)

        tk.Label(self, text="Name").pack()
        self.name = tk.Entry(self)
        self.name.pack()

        tk.Label(self, text="Subject").pack()
        self.subject = tk.Entry(self)
        self.subject.pack()

        tk.Label(self, text="Availability (e.g. Mon 2-4)").pack()
        self.availability = tk.Entry(self)
        self.availability.pack()

        tk.Label(self, text="Skill Level").pack()
        self.skill = ttk.Combobox(self, values=["Beginner", "Intermediate", "Advanced"])
        self.skill.pack()

        tk.Button(self, text="Save & Continue",
                  command=lambda: controller.show_frame(SearchPage)
                  ).pack(pady=20)


# =========================
# SEARCH PAGE
# =========================
class SearchPage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller

        tk.Label(self, text="Search Study Partner", font=("Arial", 20)).pack(pady=10)

        # INPUT FIELDS
        tk.Label(self, text="Subject ID").pack()
        self.subject = tk.Entry(self)
        self.subject.pack()

        tk.Label(self, text="Date (e.g. Monday)").pack()
        self.date = tk.Entry(self)
        self.date.pack()

        tk.Label(self, text="Time (Morning/Evening)").pack()
        self.time = tk.Entry(self)
        self.time.pack()

        tk.Label(self, text="Your Strength (Advantage)").pack()
        self.adv = tk.Entry(self)
        self.adv.pack()

        tk.Label(self, text="Your Weakness").pack()
        self.weak = tk.Entry(self)
        self.weak.pack()

        tk.Button(self, text="Search", command=self.show_results).pack(pady=10)

        self.result_label = tk.Label(self, text="", justify="left")
        self.result_label.pack(pady=10)

    def show_results(self):
        user_data = {
            'subject_id': self.subject.get(),
            'date': self.date.get(),
            'time': self.time.get(),
            'adv': self.adv.get(),
            'weak': self.weak.get()
        }

        results = "Matches:\n----------------\n"

        for student in students_db:
            score = calculate_match(user_data, student)
            results += f"{student['name']} - {score}%\n"

        self.result_label.config(text=results)


# =========================
# RUN APP
# =========================
if __name__ == "__main__":
    app = StudyGroupApp()
    app.mainloop()