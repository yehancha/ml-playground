from src.models.baseModel import BaseModel, ModelType

class EchoModel(BaseModel):
    """
    EchoModel - A simple model that echoes back the user's message
    """
    
    def __init__(self):
        """
        Initialize a new EchoModel instance
        """
        super().__init__(ModelType.CHAT, "echo")
    
    async def process(self, input_data):
        """
        Generates a response based on the user message
        
        Args:
            input_data (dict): Input containing userMessage and conversationHistory
            
        Returns:
            dict: Response object with actor and content
        """
        user_message = input_data.get("userMessage", "")
        return {
            "actor": "model",
            "content": f'You said: "{user_message}" - Hello from the Python Echo Model!'
        }
