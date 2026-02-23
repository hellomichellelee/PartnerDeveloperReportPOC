"""
GET /api/responses/export
Export filtered responses as CSV or Excel.
"""

import io
import csv
import logging
import azure.functions as func
from shared.database import (
    execute_query,
    build_where_clause,
    serialize_row,
    make_error_response,
)

logger = logging.getLogger(__name__)

COLUMNS = [
    "id", "submission_id", "question_id", "question_text",
    "response_text", "input_method", "processed", "created_at", "updated_at",
]


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        export_format = req.params.get("format", "csv").lower()

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

        query = f"""
            SELECT id, submission_id, question_id, question_text, response_text,
                   input_method, processed, created_at, updated_at
            FROM dbo.responses
            WHERE {where_clause}
            ORDER BY created_at DESC
        """
        rows = execute_query(query, tuple(params) if params else None)
        serialized = [serialize_row(r) for r in rows]

        if export_format == "xlsx":
            return _export_excel(serialized)
        else:
            return _export_csv(serialized)

    except Exception as e:
        logger.error(f"Error exporting responses: {e}")
        return make_error_response(str(e))


def _export_csv(rows: list[dict]) -> func.HttpResponse:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=COLUMNS, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)

    return func.HttpResponse(
        body=output.getvalue(),
        status_code=200,
        headers={
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=responses.csv",
        },
    )


def _export_excel(rows: list[dict]) -> func.HttpResponse:
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = "Responses"
    ws.append(COLUMNS)

    for row in rows:
        ws.append([row.get(col, "") for col in COLUMNS])

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return func.HttpResponse(
        body=output.read(),
        status_code=200,
        headers={
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": "attachment; filename=responses.xlsx",
        },
    )
