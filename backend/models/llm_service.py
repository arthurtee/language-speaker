from huggingface_hub import InferenceClient
import logging
import os

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        # Use Mistral-7B-Instruct-v0.2 or generic fallbacks
        self.model_id = "mistralai/Mistral-7B-Instruct-v0.2"
        # Try to get token from env, but client works anonymously with lower limits
        self.token = os.getenv("HF_TOKEN")
        self.client = InferenceClient(model=self.model_id, token=self.token)
        self.cache = {}

    def explain_lyrics(self, lyrics_line: str, max_words: int = 10) -> str:
        """
        Generates a concise explanation of the lyrics line.
        """
        if lyrics_line in self.cache:
            return self.cache[lyrics_line]

        prompt = f"""<s>[INST] Explain this song lyric in {max_words} words or less: "{lyrics_line}" [/INST]"""

        try:
            # Generate response
            response = self.client.text_generation(
                prompt,
                max_new_tokens=40,  # Keep it short
                temperature=0.7,
                return_full_text=False
            )
            
            explanation = response.strip()
            
            # Simple cleanup to ensure it's not too long
            words = explanation.split()
            if len(words) > max_words + 5: # Allow slight buffer
                explanation = " ".join(words[:max_words]) + "..."
            
            self.cache[lyrics_line] = explanation
            return explanation

        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            print(f"Error generating explanation: {e}")
            # Fallback simple explanations if API fails/rate limits
            return f"Meaning: {lyrics_line} (unavailable)"

llm_service = LLMService()
