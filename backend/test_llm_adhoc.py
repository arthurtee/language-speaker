from huggingface_hub import InferenceClient
import os

def test_llm():
    model_id = "gpt2"
    token = os.getenv("HF_TOKEN")
    print(f"Testing model: {model_id}")
    print(f"Token present: {bool(token)}")

    client = InferenceClient(model=model_id, token=token)
    
    prompt = "Explain the meaning of these lyrics concisely in 10 words: I want to break free"
    
    try:
        print("Sending request...")
        response = client.text_generation(
            prompt,
            max_new_tokens=50,
            temperature=0.7,
            return_full_text=False
        )
        print(f"Success! Response: {response}")
    except Exception as e:
        print(f"Error type: {type(e)}")
        print(f"Error repr: {repr(e)}")
        print(f"Error str: {str(e)}")

if __name__ == "__main__":
    test_llm()
