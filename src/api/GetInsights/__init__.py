"""
GET /api/insights
Returns all insights (theme cards).
"""

import logging
import azure.functions as func
from shared.database import (
    execute_query,
    serialize_row,
    make_json_response,
    make_error_response,
)

logger = logging.getLogger(__name__)


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        query = """
            SELECT i.id, i.theme_name, i.theme_summary, i.occurrence_count,
                   i.created_at, i.updated_at
            FROM dbo.insights i
            ORDER BY i.occurrence_count DESC
        """
        rows = execute_query(query)

        return make_json_response({
            "data": [serialize_row(r) for r in rows],
        })

    except Exception as e:
        logger.error(f"Error fetching insights: {e}")
        return make_error_response(str(e))
