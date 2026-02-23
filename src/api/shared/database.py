"""
Shared database module for read-only access to the Azure SQL survey database.
"""

import os
import json
import logging
import pymssql

logger = logging.getLogger(__name__)


def get_connection():
    """Create a connection to the Azure SQL database."""
    conn_str = os.environ.get("AZURE_SQL_CONNECTION_STRING", "")

    if not conn_str:
        raise ValueError("AZURE_SQL_CONNECTION_STRING environment variable is not set")

    # Parse connection string components
    params = {}
    for part in conn_str.split(";"):
        part = part.strip()
        if "=" in part:
            key, value = part.split("=", 1)
            params[key.strip().lower()] = value.strip()

    server = params.get("server", "").replace("tcp:", "").split(",")[0]
    database = params.get("database", "")
    user = params.get("user id", params.get("uid", ""))
    password = params.get("password", params.get("pwd", ""))

    return pymssql.connect(
        server=server,
        user=user,
        password=password,
        database=database,
        tds_version="7.4",
    )


def execute_query(query: str, params: tuple = None) -> list[dict]:
    """Execute a read-only query and return results as a list of dicts."""
    conn = get_connection()
    try:
        cursor = conn.cursor(as_dict=True)
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        rows = cursor.fetchall()
        return rows
    finally:
        conn.close()


def execute_count(query: str, params: tuple = None) -> int:
    """Execute a COUNT query and return the integer result."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        row = cursor.fetchone()
        return row[0] if row else 0
    finally:
        conn.close()


def build_where_clause(filters: dict) -> tuple[str, list]:
    """
    Build a SQL WHERE clause from a dict of filter conditions.
    Returns (where_clause_string, params_list).
    """
    conditions = []
    params = []

    for key, value in filters.items():
        if value is None or value == "":
            continue
        if key == "participantId":
            conditions.append("participant_id = %s")
            params.append(value)
        elif key == "search":
            conditions.append("response_text LIKE %s")
            params.append(f"%{value}%")
        elif key == "name_search":
            conditions.append(
                "(first_name LIKE %s OR last_name LIKE %s OR email LIKE %s)"
            )
            params.extend([f"%{value}%", f"%{value}%", f"%{value}%"])
        elif key == "question_search":
            conditions.append("question_text LIKE %s")
            params.append(f"%{value}%")
        elif key == "startDate":
            conditions.append("created_at >= %s")
            params.append(value)
        elif key == "endDate":
            conditions.append("created_at <= %s")
            params.append(value)
        elif key == "questionId":
            conditions.append("question_id = %s")
            params.append(value)
        elif key == "inputMethod":
            conditions.append("input_method = %s")
            params.append(value)
        elif key == "processed":
            conditions.append("processed = %s")
            params.append(1 if value.lower() in ("true", "1", "yes") else 0)
        elif key == "submissionId":
            conditions.append("submission_id = %s")
            params.append(value)
        elif key == "isActive":
            conditions.append("is_active = %s")
            params.append(1 if value.lower() in ("true", "1", "yes") else 0)

    where_str = " AND ".join(conditions) if conditions else "1=1"
    return where_str, params


def serialize_row(row: dict) -> dict:
    """Convert a database row dict to JSON-serializable format."""
    import datetime

    result = {}
    for key, value in row.items():
        if isinstance(value, datetime.datetime):
            result[key] = value.isoformat()
        elif isinstance(value, bytes):
            result[key] = value.decode("utf-8")
        else:
            result[key] = value
    return result


def make_json_response(data, status_code=200, headers=None):
    """Create a JSON HTTP response."""
    import azure.functions as func

    default_headers = {"Content-Type": "application/json"}
    if headers:
        default_headers.update(headers)

    body = json.dumps(data, default=str)
    return func.HttpResponse(body, status_code=status_code, headers=default_headers)


def make_error_response(message: str, status_code=500):
    """Create an error JSON HTTP response."""
    return make_json_response({"error": message}, status_code=status_code)
