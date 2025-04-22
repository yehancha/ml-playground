import os
import importlib
import inspect
import pkgutil
import sys
import logging
from typing import Dict, List, Optional, Any, Tuple

from src.models.baseModel import BaseModel

class ModelManager:
    """
    Discovers and manages model implementations.
    """
    
    def __init__(self):
        """
        Initialize the ModelManager
        """
        self.model_instances: Dict[str, BaseModel] = {}
        self.model_classes: Dict[str, type] = {}
        self.available_models: List[Dict[str, str]] = []
        self.discovered_models: List[Dict[str, str]] = []
        
        # Discover and load all model implementations
        self.discover_models()
        
        # Apply environment variable filtering after discovering models
        self.filter_models_by_environment()
        
        logging.info(f"ModelManager initialized with available models: {', '.join([model['name'] for model in self.available_models])}")
    
    def discover_models(self):
        """
        Discover all models in the implementations directory
        """
        discovered_models = []
        
        # Import the implementations package
        try:
            from src.models import implementations
            # Get the path to the implementations package
            implementations_path = os.path.dirname(implementations.__file__)
            
            # Walk through the implementations directory
            for _, module_name, is_pkg in pkgutil.iter_modules([implementations_path]):
                if module_name == '__pycache__':
                    continue
                
                try:
                    # Import the module
                    module = importlib.import_module(f"src.models.implementations.{module_name}")
                    
                    # Look for classes in the module that inherit from BaseModel
                    for name, obj in inspect.getmembers(module):
                        if (inspect.isclass(obj) and 
                            issubclass(obj, BaseModel) and 
                            obj != BaseModel):
                            
                            try:
                                # Create a temporary instance to get model info
                                temp_instance = obj()
                                model_name = temp_instance.get_model_name().lower()
                                model_type = temp_instance.get_model_type().value
                                
                                # Store the model class
                                self.model_classes[model_name] = obj
                                discovered_models.append({
                                    "type": model_type,
                                    "name": model_name,
                                })
                                
                                logging.info(f"Discovered model: {model_name} from {module_name}")
                            except Exception as e:
                                logging.warning(f"Failed to initialize model class {name}: {str(e)}")
                except Exception as e:
                    logging.error(f"Error loading model from {module_name}: {str(e)}")
        except Exception as e:
            logging.error(f"Error discovering models: {str(e)}")
        
        self.discovered_models = discovered_models
    
    def filter_models_by_environment(self):
        """
        Filter available models based on AVAILABLE_MODELS environment variable
        """
        whitelist = os.environ.get("AVAILABLE_MODELS")
        
        if not whitelist:
            # No environment restriction, use all discovered models
            self.available_models = self.discovered_models.copy()
            logging.info("No AVAILABLE_MODELS environment variable set, using all discovered models")
            return
        
        allowed_models = [model.strip().lower() for model in whitelist.split(",") if model.strip()]
        
        # Filter discovered models to only include those in the allowed list
        self.available_models = [
            model for model in self.discovered_models
            if model["name"] in allowed_models
        ]
        
        if not self.available_models:
            logging.warning("No models matched between discovered models and AVAILABLE_MODELS environment variable")
            logging.warning(f"Discovered: {', '.join([model['name'] for model in self.discovered_models])}")
            logging.warning(f"Allowed: {', '.join(allowed_models)}")
        else:
            logging.info("Filtered models based on AVAILABLE_MODELS environment variable")
            logging.info(f"Available models: {', '.join([model['name'] for model in self.available_models])}")
    
    def get_model_by_name(self, model_name):
        """
        Get a model instance by name
        
        Args:
            model_name (str): Name of the model to get
            
        Returns:
            dict: Object containing either the model instance or an error
        """
        if not model_name:
            return {
                "success": False,
                "error": "No model specified",
                "model": None
            }
        
        normalized_name = model_name.lower()
        
        if normalized_name not in [model["name"] for model in self.available_models]:
            return {
                "success": False,
                "error": f"Invalid model: {model_name}. Available models: {', '.join([model['name'] for model in self.available_models])}",
                "model": None
            }
        
        if normalized_name not in self.model_instances:
            try:
                self.model_instances[normalized_name] = self.create_model_instance(normalized_name)
                logging.info(f"Created new instance of model: {normalized_name}")
            except Exception as e:
                logging.error(f"Error creating model instance for {normalized_name}: {str(e)}")
                return {
                    "success": False,
                    "error": f"Error initializing model: {str(e)}",
                    "model": None
                }
        
        return {
            "success": True,
            "error": None,
            "model": self.model_instances[normalized_name]
        }
    
    def get_available_models(self):
        """
        Get the list of available models
        
        Returns:
            list: Array of available model names
        """
        return [model["name"] for model in self.available_models]
    
    def get_available_models_by_type(self, model_type):
        """
        Get the list of models for a specific type
        
        Args:
            model_type (str): Type of the models to return
            
        Returns:
            list: Array of available model names of the specified type
        """
        return [
            model["name"] for model in self.available_models 
            if model["type"] == model_type
        ]
    
    def create_model_instance(self, model_name):
        """
        Create a new model instance
        
        Args:
            model_name (str): Name of the model to create
            
        Returns:
            BaseModel: A new instance of the requested model
        """
        model_class = self.model_classes.get(model_name)
        
        if not model_class:
            raise ValueError(f"Model class not found for: {model_name}")
        
        return model_class()

# Create a singleton instance
model_manager = ModelManager()
