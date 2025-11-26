# db.py
import os
import mysql.connector
from mysql.connector import pooling

def load_env():
    return {
        "host": os.getenv("DB_HOST", "127.0.0.1"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", "root"),
        "database": os.getenv("DB_NAME", "inventory_it"),
    }

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        cfg = load_env()
        _pool = pooling.MySQLConnectionPool(
            pool_name="inv_pool",
            pool_size=5,
            host=cfg["host"],
            port=cfg["port"],
            user=cfg["user"],
            password=cfg["password"],
            database=cfg["database"],
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
            autocommit=True,
        )
    return _pool

def get_conn():
    return get_pool().get_connection()
