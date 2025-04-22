import logging
import os
import json
import time
from fastapi import Request
import aiohttp
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse, Response
import copy

class LoggerMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging requests and responses
    """
    
    async def send_to_logger_service(self, log_data, logger_url):
        """Send request data to logger service"""
        if logger_url:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{logger_url}/api/logs",
                        headers={"Content-Type": "application/json"},
                        json=log_data
                    ) as log_response:
                        if log_response.status != 201:
                            logging.warning(f"Failed to send log to logger service: {await log_response.text()}")
            except Exception as e:
                logging.warning(f"Error sending log to logger service: {str(e)}")
                
    async def log_request(self, log_data, logger_url, is_streaming=False):
        await self.send_to_logger_service(log_data, logger_url)
    
    async def dispatch(self, request: Request, call_next):
        # We only log process requests
        if '/process/' not in request.url.path:
            return await call_next(request)
  
        logger_url = os.environ.get("LOGGER_URL")
        start_time = time.time()
        
        # Capture request body
        request_body = await request.body()
        # Create a copy of the request with the body
        request_copy = Request(request.scope, receive=request._receive)
        
        # Parse the request body to extract model name
        model_name = None
        try:
            request_json = json.loads(request_body)
            model_name = request_json.get("modelName")
        except:
            logging.warning("Failed to parse request body as JSON")
        
        # Use the body we already read
        async def receive():
            return {"type": "http.request", "body": request_body}
        
        request._receive = receive
        
        # Process the request
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        # Convert request body to string and JSON if possible
        try:
            request_body_str = request_body.decode("utf-8")
            request_body_json = json.loads(request_body_str)
        except:
            request_body_str = str(request_body)
            request_body_json = {}
            
        # TODO: Implement response extraction
        response_body_obj = {"content": "backend-py cannot log response currently"}
        
        log_data = {
            "timestamp": int(start_time * 1000),  # Multiply by 1000 as requested
            "endpoint": request.url.path,
            "input": request_body_json,
            "model": model_name,
            "output": response_body_obj,
            "responseTimeMs": round(process_time * 1000, 2)  # Convert to ms
        }
        
        await self.log_request(log_data, logger_url, is_streaming=False)
        
        return response

def setup_logger(app):
    """
    Setup logger middleware for the application
    
    Args:
        app: The FastAPI application
    """
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Add logger middleware
    app.add_middleware(LoggerMiddleware)

