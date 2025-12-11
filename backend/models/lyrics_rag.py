import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class LyricsRAG:
    def __init__(self, data_path="data/songs.json"):
        self.data_path = data_path
        # Use a lightweight model for embeddings
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        
        self.songs_data = [] # Store metadata
        self.embeddings = None # Store vectors
        
        self._load_and_index_data()

    def _load_and_index_data(self):
        """Loads songs from JSON and creates in-memory embeddings"""
        try:
            with open(self.data_path, 'r') as f:
                songs = json.load(f)
            
            documents = []
            metadatas = []
            
            for song in songs:
                song_id = song['id']
                lyrics = song['lyrics']
                
                for i, line in enumerate(lyrics):
                    # We index the CURRENT line
                    documents.append(line)
                    
                    next_line = lyrics[i+1] if i + 1 < len(lyrics) else None
                    metadatas.append({
                        "song_id": song_id,
                        "line_number": i,
                        "next_line": next_line if next_line else "END_OF_SONG",
                        "title": song['title'],
                        "artist": song['artist'],
                        "current_line": line
                    })
            
            if documents:
                # Create embeddings
                self.embeddings = self.model.encode(documents)
                self.songs_data = metadatas
                logger.info(f"Indexed {len(documents)} lyrics lines with NumPy")
                
        except Exception as e:
            logger.error(f"Error indexing data: {e}")
            raise

    def get_next_line(self, user_input: str):
        """
        Retrieves the song and next lines based on user's sung lyrics.
        Searches across ALL songs (Global Search).
        Returns dictionary with song info and next lines.
        """
        try:
            if self.embeddings is None or len(self.songs_data) == 0:
                print("No embeddings found")
                return None
                
            # Embed user input
            user_embedding = self.model.encode([user_input])
            
            # Compute dot product
            scores = np.dot(self.embeddings, user_embedding.T).flatten()
            
            # Find best match globally
            best_idx = np.argmax(scores)
            best_score = scores[best_idx]
            
            matched_metadata = self.songs_data[best_idx]
            
            # Similarity threshold (Higher is better for cosine similarity)
            # 1.0 is exact match, 0.0 is orthogonal
            if best_score < 0.5: # Lower threshold for discovery
                logger.info(f"Low confidence match: {best_score} for '{user_input}'")
                return None
            
            logger.info(f"Global Match: '{matched_metadata['title']}' - Score: {best_score}")
            
            # Get next 2 lines
            # We need to find the song in self.songs_data to get subsequent lines
            # self.songs_data is flat list, but we can index into it
            
            next_lines = []
            
            # Line + 1
            if best_idx + 1 < len(self.songs_data):
                next_meta = self.songs_data[best_idx + 1]
                if next_meta['song_id'] == matched_metadata['song_id']:
                   next_lines.append(next_meta['current_line'])
            
            # Line + 2
            if best_idx + 2 < len(self.songs_data):
                next_meta_2 = self.songs_data[best_idx + 2]
                if next_meta_2['song_id'] == matched_metadata['song_id']:
                   next_lines.append(next_meta_2['current_line'])

            return {
                "song_id": matched_metadata['song_id'],
                "title": matched_metadata['title'],
                "artist": matched_metadata.get('artist', 'Unknown'), # Add safely
                "matched_line": matched_metadata['current_line'],
                "matched_line_number": matched_metadata['line_number'],
                "next_lines": next_lines,
                "confidence": float(best_score)
            }
            
        except Exception as e:
            logger.error(f"Error identifying lyrics: {e}")
            return None

# Singleton instance
lyrics_rag = LyricsRAG()
