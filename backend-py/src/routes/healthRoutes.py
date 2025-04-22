from fastapi import APIRouter, Request
from datetime import datetime

# Create a router instance
router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Returns:
        dict: Response with status and timestamp
    """
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }

def setup_routes(app):
    """
    Setup health routes for the application
    
    Args:
        app: The FastAPI application
    """
    app.include_router(router)

