"""
GET /api/health
Health check endpoint — verifies database connectivity.
"""

import logging
import azure.functions as func
from shared.database import execute_query, make_json_response, make_error_response

logger = logging.getLogger(__name__)


def main(req: func.HttpRequest) -> func.HttpResponse:
    status = {
        "status": "healthy",
        "database": "unknown",
    }

    try:
        result = execute_query("SELECT 1 AS ok")
        if result and result[0].get("ok") == 1:
            status["database"] = "connected"
        else:
            status["database"] = "unexpected response"
            status["status"] = "degraded"
    except Exception as e:
        logger.error(f"Health check DB error: {e}")
        status["database"] = f"error: {str(e)}"
        status["status"] = "unhealthy"

    code = 200 if status["status"] == "healthy" else 503
    return make_json_response(status, status_code=code)
