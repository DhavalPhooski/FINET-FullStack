import os
import sys

# Calculate project paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVER_DIR = os.path.join(BASE_DIR, "server")

# Add paths for module resolution
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
if SERVER_DIR not in sys.path:
    sys.path.append(SERVER_DIR)

# EXPLICIT TOP-LEVEL APP OBJECT (Required by Vercel)
# This is a direct import that avoids complex try/except blocks to help Vercel's scanner.
from server.main import app

# Ensure Vercel can find the 'app' even if imported indirectly
# (This acts as a second export just in case)
application = app
