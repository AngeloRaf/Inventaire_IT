# models.py
from db import get_conn

def list_items():
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT id, model, name, category, status, comment, location, assigned_to,
                   purchase_date, warranty_end, quantity, created_at, updated_at
            FROM items
            ORDER BY created_at DESC
        """)
        return cur.fetchall()
    finally:
        conn.close()

def get_item(item_id):
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT id, model, name, category, status, comment, location, assigned_to,
                   purchase_date, warranty_end, quantity, created_at, updated_at
            FROM items
            WHERE id = %s
        """, (item_id,))
        return cur.fetchone()
    finally:
        conn.close()

def create_item(data):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO items (id, model, name, category, status, comment, location, assigned_to,
                               purchase_date, warranty_end, quantity)
            VALUES (UUID(), %s, %s, %s, %s, %s, %s, %s, %s, %s, COALESCE(%s,1))
        """, (
            data.get("model"),
            data["name"],
            data["category"],
            data["status"],
            data.get("comment"),
            data.get("location"),
            data.get("assignedTo"),
            data.get("purchaseDate"),
            data.get("warrantyEnd"),
            data.get("quantity"),
        ))
        # Récupérer l'ID inséré (via SELECT LAST_INSERT_ID() ne marche pas pour UUID())
        cur.execute("SELECT id FROM items ORDER BY created_at DESC LIMIT 1")
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id
    finally:
        conn.close()

def update_item(item_id, data):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            UPDATE items
            SET model=%s, name=%s, category=%s, status=%s, comment=%s, location=%s,
                assigned_to=%s, purchase_date=%s, warranty_end=%s, quantity=COALESCE(%s,1)
            WHERE id=%s
        """, (
            data.get("model"),
            data["name"],
            data["category"],
            data["status"],
            data.get("comment"),
            data.get("location"),
            data.get("assignedTo"),
            data.get("purchaseDate"),
            data.get("warrantyEnd"),
            data.get("quantity"),
            item_id,
        ))
        conn.commit()
        return cur.rowcount
    finally:
        conn.close()

def delete_item(item_id):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM items WHERE id=%s", (item_id,))
        conn.commit()
        return cur.rowcount
    finally:
        conn.close()
