import os
import sys

# Forward DB schema execution to the new scripts package
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scripts.setup_db import setup_database

if __name__ == "__main__":
    setup_database()
