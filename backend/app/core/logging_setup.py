from __future__ import annotations

import logging
import os
from pythonjsonlogger import jsonlogger


def configure_logging() -> None:
    level = logging.DEBUG if os.getenv("DEBUG", "false").lower() == "true" else logging.INFO
    logger = logging.getLogger()
    logger.setLevel(level)
    log_handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    log_handler.setFormatter(formatter)
    logger.handlers = [log_handler]


