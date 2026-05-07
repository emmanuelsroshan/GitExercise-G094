import sqlite3

DB_NAME = "data.db"

# connect to database
def connect():
    return sqlite3.connect(DB_NAME)

# create table
def create_table():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        subject TEXT,
        skill TEXT,
        availability TEXT
    )
    """)

    conn.commit()
    conn.close()

# save user
def save_user(name, subject, skill, availability):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO users (name, subject, skill, availability)
    VALUES (?, ?, ?, ?)
    """, (name, subject, skill, availability))

    conn.commit()
    conn.close()

# get all users
def get_users():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users")
    data = cursor.fetchall()

    conn.close()
    return data

# search by subject
def search_by_subject(subject):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE subject=?", (subject,))
    data = cursor.fetchall()

    conn.close()
    return data

    #git test s
#git test 2 