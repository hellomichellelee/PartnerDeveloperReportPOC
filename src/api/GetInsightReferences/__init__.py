"""
GET /api/insights/{insightId}/references
Returns paginated references for a specific insight, joined with responses for created_at.
"""

import logging
import azure.functions as func
from shared.database import (
    execute_query,
    execute_count,
    serialize_row,
    make_json_response,
    make_error_response,
)

logger = logging.getLogger(__name__)

ALLOWED_SORT_COLUMNS = {
    "excerpt", "participant_id", "created_at",
}


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        insight_id = req.route_params.get("insightId")
        if not insight_id:
            return make_error_response("insightId is required", 400)

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

        # Count total
        count_query = """
            SELECT COUNT(*)
            FROM dbo.insight_references ir
            WHERE ir.insight_id = %s
        """
        total_records = execute_count(count_query, (insight_id,))

        # Fetch page with join to responses for created_at
        offset = (page - 1) * page_size
        data_query = f"""
            SELECT ir.id, ir.insight_id, ir.excerpt, ir.participant_id,
                   ir.submission_id, r.created_at
            FROM dbo.insight_references ir
            LEFT JOIN dbo.responses r ON ir.submission_id = r.submission_id
            WHERE ir.insight_id = %s
            ORDER BY {sort_by} {sort_order}
            OFFSET %s ROWS FETCH NEXT %s ROWS ONLY
        """
        rows = execute_query(data_query, (insight_id, offset, page_size))

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
        logger.error(f"Error fetching insight references: {e}")
        return make_error_response(str(e))
