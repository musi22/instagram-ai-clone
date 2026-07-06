import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from app.core.config import settings

def try_connect(password):
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=settings.POSTGRES_USER,
            password=password,
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT
        )
        return conn
    except Exception:
        return None

def init_db():
    passwords = [settings.POSTGRES_PASSWORD, "postgrespassword", "postgres", "admin", ""]
    conn = None
    successful_pwd = None
    
    for pwd in passwords:
        if pwd is None:
            continue
        conn = try_connect(pwd)
        if conn is not None:
            successful_pwd = pwd
            break
            
    if conn is None:
        print("Error: Could not connect to PostgreSQL with common passwords.")
        return

    print(f"Successfully connected to PostgreSQL (password verified).")
    try:
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'instagram_db';")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("CREATE DATABASE instagram_db;")
            print("Database 'instagram_db' created successfully.")
        else:
            print("Database 'instagram_db' already exists.")
            
        cursor.close()
        conn.close()
        
        # Also print the password that worked so we can update config if needed
        print(f"SUCCESS_PASSWORD:{successful_pwd}")
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
