"""
GET /api/questions
Returns survey question definitions, optionally filtered by active status.
"""

import logging
import azure.functions as func
from shared.database import (
    execute_query,
    execute_count,
    build_where_clause,
    serialize_row,
    make_json_response,
    make_error_response,
)

logger = logging.getLogger(__name__)

ALLOWED_SORT_COLUMNS = {
    "id", "question_id", "question_order", "is_active", "created_at",
}


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        sort_by = req.params.get("sortBy", "question_order")
        sort_order = req.params.get("sortOrder", "asc").upper()

        if sort_by not in ALLOWED_SORT_COLUMNS:
            sort_by = "question_order"
        if sort_order not in ("ASC", "DESC"):
            sort_order = "ASC"

        filters = {
            "isActive": req.params.get("isActive"),
            "question_search": req.params.get("search"),
        }

        where_clause, params = build_where_clause(filters)

        data_query = f"""
            SELECT id, question_id, question_text, question_order,
                   is_active, created_at, updated_at
            FROM dbo.questions
            WHERE {where_clause}
            ORDER BY {sort_by} {sort_order}
        """
        rows = execute_query(data_query, tuple(params) if params else None)

        return make_json_response({
            "data": [serialize_row(r) for r in rows],
            "pagination": {
                "page": 1,
                "pageSize": len(rows),
                "totalRecords": len(rows),
                "totalPages": 1,
            },
        })

    except Exception as e:
        logger.error(f"Error fetching questions: {e}")
        return make_error_response(str(e))
