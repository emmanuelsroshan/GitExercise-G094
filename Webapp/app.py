from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

# ✅ Create database
def init_db():
    conn = sqlite3.connect('students.db')
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            subject TEXT,
            availability TEXT,
            strengths TEXT
        )
    ''')

    conn.commit()
    conn.close()

# ✅ Home route
@app.route('/')
def home():
    return "Study Matchmaker Backend Running!"

# ✅ Add user API
@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json

    conn = sqlite3.connect('students.db')
    c = conn.cursor()

    c.execute(
        "INSERT INTO users (name, subject, availability, strengths) VALUES (?, ?, ?, ?)",
        (data['name'], data['subject'], data['availability'], data['strengths'])
    )

    conn.commit()
    conn.close()

    return {"message": "User added successfully"}

# ✅ Get all users API
@app.route('/get_users', methods=['GET'])
def get_users():
    conn = sqlite3.connect('students.db')
    c = conn.cursor()

    c.execute("SELECT * FROM users")
    users = c.fetchall()

    conn.close()

    return jsonify(users)

# ✅ Run server (ALWAYS LAST)
@app.route('/search', methods=['GET'])
def search_users():
    subject = request.args.get('subject')

    conn = sqlite3.connect('students.db')
    c = conn.cursor()

    c.execute("SELECT * FROM users WHERE subject = ?", (subject,))
    users = c.fetchall()

    conn.close()

    return jsonify(users)

def calculate_match(avail1, avail2):
    set1 = set(avail1.split(','))
    set2 = set(avail2.split(','))

    common_days = set1.intersection(set2)
    total_days = set1.union(set2)

    if not total_days:
        return 0

    match_percentage = (len(common_days) / len(total_days)) * 100
    return round(match_percentage, 2)
if __name__ == '__main__':
    init_db()
    app.run(debug=True)