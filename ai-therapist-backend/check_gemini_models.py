# D:\ai-therapist-backend\check_gemini_models.py
import os
import google.generativeai as genai

# IMPORTANT: Make sure this API key is the same one you use in app.py
# and that it's correctly set.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "***REMOVED***")

genai.configure(api_key=GEMINI_API_KEY)

print("\n--- Listing Available Gemini Models (from check_gemini_models.py) ---")
try:
    for m in genai.list_models():
        # Only print models that support 'generateContent' for text generation
        if 'generateContent' in m.supported_generation_methods:
            print(f"Name: {m.name}, Supported Methods: {m.supported_generation_methods}")
    print("-------------------------------------------------------------------\n")
except Exception as e:
    print(f"Error listing models: {e}. Please check your API key and network connection.")