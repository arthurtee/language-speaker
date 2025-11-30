import torch
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import soundfile as sf
import numpy as np
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class TTSModel:
    _instance: Optional['TTSModel'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        logger.info("Loading TTS model...")
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load SpeechT5 model
        self.processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
        self.model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
        self.vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
        
        self.model.to(device)
        self.vocoder.to(device)
        
        # Load speaker embeddings
        embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
        self.speaker_embeddings = torch.tensor(embeddings_dataset[7306]["xvector"]).unsqueeze(0)
        self.speaker_embeddings = self.speaker_embeddings.to(device)
        
        self.device = device
        self._initialized = True
        logger.info(f"TTS model loaded successfully on {device}")
    
    def synthesize(self, text: str, output_path: str) -> str:
        """Synthesize speech from text and save to file"""
        inputs = self.processor(text=text, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            speech = self.model.generate_speech(
                inputs["input_ids"],
                self.speaker_embeddings,
                vocoder=self.vocoder
            )
        
        # Convert to numpy and save
        speech_np = speech.cpu().numpy()
        sf.write(output_path, speech_np, samplerate=16000)
        
        return output_path

# Singleton instance
tts_model = TTSModel()
