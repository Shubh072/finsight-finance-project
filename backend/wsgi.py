import os
from dotenv import load_dotenv

# Load enterprise configurations from local or secret environment variables
load_dotenv()

from backend.app import create_app

# Instantiate the application
app = create_app()

if __name__ == "__main__":
    # Boot server natively in local development environment
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "False") == "True")
