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
@app.route('/match', methods=['GET'])
def match_users():
    subject = request.args.get('subject')
    user_id = request.args.get('user_id')

    conn = sqlite3.connect('students.db')
    c = conn.cursor()

    # Get current user
    c.execute("SELECT availability FROM users WHERE id = ?", (user_id,))
    current_user = c.fetchone()

    if not current_user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    current_availability = current_user[0]

    # Get other users with same subject
    c.execute(
        "SELECT id, name, availability FROM users WHERE subject = ? AND id != ?",
        (subject, user_id)
    )
    users = c.fetchall()
    conn.close()

    results = []

    for u in users:
        other_availability = u[2]
        match_percentage = calculate_match(current_availability, other_availability)

        results.append({
            "id": u[0],
            "name": u[1],
            "match_percentage": match_percentage
        })

    return jsonify(results)
if __name__ == '__main__':
    init_db()
    app.run(debug=True)