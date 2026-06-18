import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # App Settings
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    
    # Database Settings
    DEFAULT_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "pioneer_nexus.db"))
    DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    # GenAI Settings
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Security Settings
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    
    ALLOWED_TABLES = ['pharmasales', 'inventory', 'products', 'warehouses', 'chat_session_history']

config = Config()
