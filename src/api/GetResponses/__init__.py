"""
GET /api/responses
Returns paginated, filtered, sorted survey responses.
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
    "id", "participant_id", "submission_id", "question_id", "input_method",
    "processed", "created_at", "updated_at",
}


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Parse query params
        page = int(req.params.get("page", "1"))
        page_size = int(req.params.get("pageSize", "25"))
        sort_by = req.params.get("sortBy", "created_at")
        sort_order = req.params.get("sortOrder", "desc").upper()

        # Validate
        page = max(1, page)
        page_size = max(1, min(100, page_size))
        if sort_by not in ALLOWED_SORT_COLUMNS:
            sort_by = "created_at"
        if sort_order not in ("ASC", "DESC"):
            sort_order = "DESC"

        # Build filters
        filters = {
            "questionId": req.params.get("questionId"),
            "inputMethod": req.params.get("inputMethod"),
            "processed": req.params.get("processed"),
            "startDate": req.params.get("startDate"),
            "endDate": req.params.get("endDate"),
            "submissionId": req.params.get("submissionId"),
            "search": req.params.get("search"),
        }

        where_clause, params = build_where_clause(filters)

        # Count total records
        count_query = f"SELECT COUNT(*) FROM dbo.responses WHERE {where_clause}"
        total_records = execute_count(count_query, tuple(params))

        # Fetch page
        offset = (page - 1) * page_size
        data_query = f"""
            SELECT id, participant_id, submission_id, question_id, question_text, response_text,
                   input_method, processed, created_at, updated_at
            FROM dbo.responses
            WHERE {where_clause}
            ORDER BY {sort_by} {sort_order}
            OFFSET %s ROWS FETCH NEXT %s ROWS ONLY
        """
        data_params = tuple(params) + (offset, page_size)
        rows = execute_query(data_query, data_params)

        total_pages = max(1, -(-total_records // page_size))  # ceil division

        return make_json_response({
            "data": [serialize_row(r) for r in rows],
            "pagination": {
                "page": page,
                "pageSize": page_size,
                "totalRecords": total_records,
                "totalPages": total_pages,
            },
        })

    except Exception as e:
        logger.error(f"Error fetching responses: {e}")
        return make_error_response(str(e))
