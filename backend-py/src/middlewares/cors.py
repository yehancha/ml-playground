from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    """
    Setup CORS middleware for the application
    
    Args:
        app: The FastAPI application
    """
    # Configure CORS
    # Allow all for development purposes
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins
        allow_credentials=True,
        allow_methods=["*"],  # Allow all methods
        allow_headers=["*"],  # Allow all headers
    )

