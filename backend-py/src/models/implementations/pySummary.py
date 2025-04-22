from src.models.baseModel import BaseModel, ModelType

class PySummary(BaseModel):
    """
    A model that sends the same summary for any input.
    """

    def __init__(self):
        super().__init__(ModelType.SUMMARIZE, 'py-summary')

    async def process(self, input_data: dict) -> dict:
        """
        Summarize the input text by returning a fixed summary.

        Args:
            input_data (dict): Input containing 'originalText'.

        Returns:
            dict: Response object with 'actor' and 'summary'.
        """
        return {
            'actor': 'model',
            'summary': 'This is from the Python environment'
        }