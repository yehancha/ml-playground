from abc import ABC, abstractmethod
from enum import Enum, auto

class ModelType(Enum):
    """
    Enum for model types
    """
    CHAT = "CHAT"
    SUMMARIZE = "SUMMARIZE"
    GENERATE_IMAGE = "GENERATE_IMAGE"

class BaseModel(ABC):
    """
    BaseModel - Abstract base class for all model implementations
    Provides the interface that all model implementations must follow
    """
    
    def __init__(self, model_type, model_name):
        """
        Initialize a new model instance
        
        Args:
            model_type (ModelType or str): Type of the model
            model_name (str): Name of the model (identifier)
        """
        if self.__class__ == BaseModel:
            raise TypeError("BaseModel is an abstract class and cannot be instantiated directly.")
        
        # Convert string to ModelType if necessary
        if isinstance(model_type, str):
            model_type = model_type.upper()
            if model_type not in [t.value for t in ModelType]:
                raise ValueError(f"Unsupported model type {model_type} for model {model_name}")
            # Convert string to enum
            model_type = ModelType(model_type)
        elif not isinstance(model_type, ModelType):
            raise TypeError(f"model_type must be a ModelType enum or string, got {type(model_type)}")
            
        self.model_type = model_type
        self.model_name = model_name
    
    def get_model_type(self):
        """
        Returns the type of the model
        
        Returns:
            ModelType: The model type
        """
        return self.model_type
    
    def get_model_name(self):
        """
        Returns the name of the model (identifier)
        
        Returns:
            str: The model name
        """
        return self.model_name
    
    @abstractmethod
    async def process(self, input_data):
        """
        Processes the input and produces an output
        
        Args:
            input_data (dict): Input for the model
            
        Returns:
            dict: Output from the model
        """
        raise NotImplementedError("process method must be implemented by subclasses")

