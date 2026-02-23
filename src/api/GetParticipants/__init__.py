"""
GET /api/participants
Returns paginated, filtered, sorted participant data.
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
    "id", "submission_id", "first_name", "last_name",
    "email", "consent_given", "consent_timestamp", "created_at",
}


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        page = int(req.params.get("page", "1"))
        page_size = int(req.params.get("pageSize", "25"))
        sort_by = req.params.get("sortBy", "created_at")
        sort_order = req.params.get("sortOrder", "desc").upper()

        page = max(1, page)
        page_size = max(1, min(100, page_size))
        if sort_by not in ALLOWED_SORT_COLUMNS:
            sort_by = "created_at"
        if sort_order not in ("ASC", "DESC"):
            sort_order = "DESC"

        filters = {
            "name_search": req.params.get("search"),
            "startDate": req.params.get("startDate"),
            "endDate": req.params.get("endDate"),
        }

        where_clause, params = build_where_clause(filters)

        count_query = f"SELECT COUNT(*) FROM dbo.participants WHERE {where_clause}"
        total_records = execute_count(count_query, tuple(params))

        offset = (page - 1) * page_size
        data_query = f"""
            SELECT id, submission_id, first_name, last_name, email,
                   consent_given, consent_timestamp, created_at, updated_at
            FROM dbo.participants
            WHERE {where_clause}
            ORDER BY {sort_by} {sort_order}
            OFFSET %s ROWS FETCH NEXT %s ROWS ONLY
        """
        data_params = tuple(params) + (offset, page_size)
        rows = execute_query(data_query, data_params)

        total_pages = max(1, -(-total_records // page_size))

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
        logger.error(f"Error fetching participants: {e}")
        return make_error_response(str(e))
