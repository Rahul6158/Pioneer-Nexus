import logging
import json
import time
from datetime import datetime

class JsonFormatter(logging.Formatter):
    """Custom formatter to log output in structured JSON format."""
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "extra"):
            log_data.update(record.extra)
        return json.dumps(log_data)

def configure_logging(level=logging.INFO):
    """Configures root logger to use JSON formatting."""
    root_logger = logging.getLogger()
    if root_logger.handlers:
        for handler in list(root_logger.handlers):
            root_logger.removeHandler(handler)
            
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    
    root_logger.addHandler(handler)
    root_logger.setLevel(level)
    
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("prophet").setLevel(logging.WARNING)
    logging.getLogger("cmdstanpy").setLevel(logging.WARNING)

class LogExecutionTime:
    """Context manager to measure and log block execution duration."""
    def __init__(self, operation_name, logger_instance=None):
        self.operation_name = operation_name
        self.logger = logger_instance or logging.getLogger(__name__)
        
    def __enter__(self):
        self.start_time = time.time()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (time.time() - self.start_time) * 1000
        extra = {"duration_ms": round(duration, 2), "operation": self.operation_name}
        if exc_type:
            self.logger.error(
                f"Operation '{self.operation_name}' failed after {duration:.2f}ms", 
                extra={**extra, "error": str(exc_val)},
                exc_info=(exc_type, exc_val, exc_tb)
            )
        else:
            self.logger.info(
                f"Operation '{self.operation_name}' completed successfully in {duration:.2f}ms", 
                extra=extra
            )
