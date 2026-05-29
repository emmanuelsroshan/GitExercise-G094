import sqlite3

DB_NAME = "students.db"


def connect():
    return sqlite3.connect(DB_NAME)


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


def save_user(name, subject_id, time_slots, advantage, weakness):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO users (name, subject_id, time_slots, advantage, weakness)
    VALUES (?, ?, ?, ?, ?)
    """, (name, subject_id, time_slots, advantage, weakness))

    conn.commit()
    conn.close()


def get_users():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()

    users = []

    for row in rows:
        users.append({
            "id": row[0],
            "name": row[1],
            "subject_id": row[2],
            "time_slots": row[3],
            "advantage": row[4],
            "weakness": row[5]
        })

    conn.close()
    return users


def get_user_by_name(name):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM users
    WHERE name = ?
    """, (name,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "id": row[0],
            "name": row[1],
            "subject_id": row[2],
            "time_slots": row[3],
            "advantage": row[4],
            "weakness": row[5]
        }

    return None


def update_user(name, subject_id, time_slots, advantage, weakness):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    UPDATE users
    SET subject_id = ?, time_slots = ?, advantage = ?, weakness = ?
    WHERE name = ?
    """, (subject_id, time_slots, advantage, weakness, name))

    conn.commit()
    conn.close()


def save_or_update_user(name, subject_id, time_slots, advantage, weakness):
    existing_user = get_user_by_name(name)

    if existing_user:
        update_user(name, subject_id, time_slots, advantage, weakness)
    else:
        save_user(name, subject_id, time_slots, advantage, weakness)