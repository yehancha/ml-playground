import os
import logging
import asyncio
import aiohttp
import json
from typing import Dict, List, Optional

class ServiceRegistry:
    """
    Handles registering with Service Registry in cluster mode.
    """
    
    def __init__(self, model_manager):
        """
        Initialize the ServiceRegistry
        
        Args:
            model_manager: The ModelManager instance
        """
        self.registry_url = os.environ.get("REGISTRY_URL")
        self.service_url = os.environ.get("SERVICE_URL")
        self.enabled = bool(self.registry_url)
        self.model_manager = model_manager
        
    async def register(self):
        """
        Register this service with the registry
        """
        if not self.enabled:
            return
        
        try:
            models = [
                {"name": model["name"], "type": model["type"]}
                for model in self.model_manager.available_models
            ]
            
            logging.info(f"Registering with registry at {self.registry_url} with {len(models)} models")
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.registry_url}/register",
                    headers={"Content-Type": "application/json"},
                    json={
                        "url": self.service_url,
                        "models": models
                    }
                ) as response:
                    if response.status != 200:
                        error = await response.text()
                        logging.error(f"Failed to register with registry: {error}")
                        
                        # Retry registration after delay
                        asyncio.create_task(self._retry_register())
        except Exception as e:
            logging.error(f"Error registering with registry: {str(e)}")
            
            # Retry registration after delay
            asyncio.create_task(self._retry_register())
    
    async def _retry_register(self):
        """
        Retry registration after a delay
        """
        await asyncio.sleep(10)
        await self.register()
    
    async def unregister(self):
        """
        Unregister this service from the registry
        """
        if not self.enabled:
            return
        
        try:
            logging.info(f"Unregistering from registry at {self.registry_url}")
            
            async with aiohttp.ClientSession() as session:
                async with session.delete(
                    f"{self.registry_url}/unregister",
                    headers={"Content-Type": "application/json"},
                    json={
                        "url": self.service_url
                    }
                ) as response:
                    if response.status != 200:
                        error = await response.text()
                        logging.error(f"Failed to unregister from registry: {error}")
        except Exception as e:
            logging.error(f"Error unregistering from registry: {str(e)}")

