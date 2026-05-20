import sqlite3

DB_NAME = "students.db"

def connect():
    return sqlite3.connect(DB_NAME)


# create table (run once)
def create_table():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        subject_id TEXT,
        time_slots TEXT,
        advantage TEXT,
        weakness TEXT
    )
    """)

    conn.commit()
    conn.close()


# save user
def save_user(name, subject, time_slots, advantage, weakness):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO users (name, subject_id, time_slots, advantage, weakness)
    VALUES (?, ?, ?, ?, ?)
    """, (name, subject, time_slots, advantage, weakness))

    conn.commit()
    conn.close()


# get all users
def get_users():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()

    users = []
    for r in rows:
        users.append({
            'name': r[1],
            'subject_id': r[2],
            'time_slots': r[3],
            'advantage': r[4],
            'weakness': r[5]
        })

    conn.close()
    return users