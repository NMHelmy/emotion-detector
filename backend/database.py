import sqlite3

def create_connection():
    conn = sqlite3.connect("users.db")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def create_table():
    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        image TEXT
    );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS histories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emotion TEXT,
            image BLOB,
            date TEXT,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)


    conn.commit()
    conn.close()



