import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional

DB_PATH = "/data/app.db"

def init_db():
    """Initialize the database and create tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tenant_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create index for faster tenant lookups
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_tenant_id 
        ON tenant_data(tenant_id)
    """)
    
    conn.commit()
    conn.close()

def insert_data(tenant_id: str, value: str) -> int:
    """Insert a new record for a tenant."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO tenant_data (tenant_id, value, created_at)
        VALUES (?, ?, ?)
    """, (tenant_id, value, datetime.utcnow().isoformat()))
    
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return record_id

def get_tenant_data(tenant_id: str) -> List[Dict]:
    """Get all records for a specific tenant."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, tenant_id, value, created_at
        FROM tenant_data
        WHERE tenant_id = ?
        ORDER BY created_at DESC
    """, (tenant_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": row["id"],
            "tenant_id": row["tenant_id"],
            "value": row["value"],
            "created_at": row["created_at"]
        }
        for row in rows
    ]

