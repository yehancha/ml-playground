import os
import logging
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from contextlib import asynccontextmanager
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Load environment variables from .env file if present
load_dotenv()

# Import src modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.models.modelManager import model_manager
from src.serviceRegistry import ServiceRegistry
from src.middlewares.cors import setup_cors
from src.middlewares.logger import setup_logger
from src.routes import healthRoutes, modelRoutes

service_registry = ServiceRegistry(model_manager)

@asynccontextmanager
async def lifespan(app):
    """Lifespan context manager for FastAPI"""

    # Startup
    logging.info("Starting up backend-py service...")
    logging.info(f"Available models: {', '.join(model_manager.get_available_models())}")
    await service_registry.register()
    
    # Yield control to FastAPI
    yield
    
    # Shutdown
    logging.info("Shutting down backend-py service...")
    await service_registry.unregister()

app = FastAPI(lifespan=lifespan)

# Setup middleware
setup_cors(app)
setup_logger(app)

# Setup routes
healthRoutes.setup_routes(app)
modelRoutes.setup_routes(app, model_manager)

def start_server():
    """Start the server"""
    
    port = int(os.environ.get("BACKEND_PORT", 3011))
    
    logging.info(f"Backend server starting at port {port}")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info"
    )

if __name__ == "__main__":
    start_server()

