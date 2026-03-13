"""
POST /api/insights/refresh
Triggers the AI insights pipeline to regenerate insight data.
"""

import json
import logging
import os
import subprocess
import sys

import azure.functions as func

logger = logging.getLogger(__name__)


def main(req: func.HttpRequest) -> func.HttpResponse:
    pipeline_dir = os.environ.get("AI_PIPELINE_DIR", "")

    if not pipeline_dir or not os.path.isdir(pipeline_dir):
        logger.error("AI_PIPELINE_DIR is not set or does not exist: %s", pipeline_dir)
        return func.HttpResponse(
            json.dumps({"status": "error", "message": "Pipeline directory not configured"}),
            status_code=500,
            mimetype="application/json",
        )

    script = os.path.join(pipeline_dir, "run_pipeline.py")
    if not os.path.isfile(script):
        logger.error("Pipeline script not found: %s", script)
        return func.HttpResponse(
            json.dumps({"status": "error", "message": "Pipeline script not found"}),
            status_code=500,
            mimetype="application/json",
        )

    try:
        logger.info("Running AI insights pipeline from %s", pipeline_dir)
        result = subprocess.run(
            [sys.executable, script, "--phase", "insights"],
            cwd=pipeline_dir,
            capture_output=True,
            text=True,
            timeout=300,
        )

        if result.returncode != 0:
            logger.error("Pipeline failed (exit %d): %s", result.returncode, result.stderr)
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "message": f"Pipeline exited with code {result.returncode}",
                    "details": result.stderr[-1000:] if result.stderr else "",
                }),
                status_code=500,
                mimetype="application/json",
            )

        logger.info("Pipeline completed successfully")
        return func.HttpResponse(
            json.dumps({"status": "ok", "message": "Insights refreshed successfully"}),
            status_code=200,
            mimetype="application/json",
        )

    except subprocess.TimeoutExpired:
        logger.error("Pipeline timed out")
        return func.HttpResponse(
            json.dumps({"status": "error", "message": "Pipeline timed out after 300 seconds"}),
            status_code=504,
            mimetype="application/json",
        )
    except Exception as e:
        logger.error("Failed to run pipeline: %s", e)
        return func.HttpResponse(
            json.dumps({"status": "error", "message": str(e)}),
            status_code=500,
            mimetype="application/json",
        )
