from fastapi import APIRouter, Request, HTTPException, Body
from typing import Dict, Any, List

# Create a router instance
router = APIRouter()

# Reference to model manager (to be set in setup)
model_manager = None

@router.post("/api/process/chat")
async def process_chat(request_data: Dict[str, Any] = Body(...)):
    """
    Prompts a given model with a user message and conversation history
    
    Args:
        request_data (dict): Request body containing modelName and other data
        
    Returns:
        dict: Response from the model
    """
    try:
        model_name = request_data.get("modelName")
        if not model_name:
            return {
                "actor": "system",
                "content": "Error: Model name must be specified in the request.",
                "error": "Missing model name"
            }
        
        model_result = model_manager.get_model_by_name(model_name)
        
        if not model_result["success"]:
            return {
                "actor": "system",
                "content": f"Error: {model_result['error']}",
                "error": model_result["error"]
            }
        
        response = await model_result["model"].process(request_data)
        return response
    except Exception as e:
        # Log the error
        import logging
        logging.exception("Error processing prompt")
        
        return {
            "actor": "model",
            "content": "Error processing your request.",
            "error": "Error processing your request."
        }

@router.post("/api/process/summarize")
async def process_summarize(request_data: Dict[str, Any] = Body(...)):
    """
    Prompts a given model with a original text and summarize it
    
    Args:
        request_data (dict): Request body containing modelName and other data
        
    Returns:
        dict: Response from the model
    """
    try:
        model_name = request_data.get("modelName")
        
        if not model_name:
            return {
                "summary": "Error: Model name must be specified in the request.",
                "error": "Missing model name"
            }
        
        model_result = model_manager.get_model_by_name(model_name)
        
        if not model_result["success"]:
            return {
                "summary": f"Error: {model_result['error']}",
                "error": model_result["error"]
            }
        
        response = await model_result["model"].process(request_data)
        return response
    except Exception as e:
        # Log the error
        import logging
        logging.exception("Error processing prompt")
        
        return {
            "summary": "Error processing your request. Please try again."
        }

@router.get("/api/models")
async def get_models():
    """
    Get available models
    
    Returns:
        dict: Object containing array of available models
    """
    try:
        available_models = model_manager.get_available_models()
        return {
            "availableModels": available_models
        }
    except Exception as e:
        # Log the error
        import logging
        logging.exception("Error getting models")
        
        return {
            "success": False,
            "message": "Error retrieving models"
        }

@router.get("/api/models/types/{model_type}")
async def get_models_by_type(model_type: str):
    """
    Get available models by type
    
    Args:
        model_type (str): Type of models to retrieve
        
    Returns:
        dict: Object containing array of available models of the specified type
    """
    try:
        available_models = model_manager.get_available_models_by_type(model_type)
        return {
            "availableModels": available_models
        }
    except Exception as e:
        # Log the error
        import logging
        logging.exception("Error getting models")
        
        return {
            "success": False,
            "message": "Error retrieving models"
        }

def setup_routes(app, manager):
    """
    Setup model routes for the application
    
    Args:
        app: The FastAPI application
        manager: The ModelManager instance
    """
    global model_manager
    model_manager = manager
    app.include_router(router)

