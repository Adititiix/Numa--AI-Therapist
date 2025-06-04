
    # D:\ai-therapist-backend\app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Configuration Variables ---
# IMPORTANT: Replace "YOUR_GOOGLE_CLIENT_ID" with your actual Client ID from Google Cloud Console.
# This is used for verifying Google ID tokens.
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "263293889539-s3v3aah0tsdv6j8celhn3eh955i8dqlr.apps.googleusercontent.com")

# IMPORTANT: Replace "YOUR_GEMINI_API_KEY" with your actual Gemini API key from Google AI Studio.
# In a production environment, always load API keys from environment variables for security.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "***REMOVED***")

# --- Gemini API Setup ---
genai.configure(api_key=GEMINI_API_KEY)

# Define the therapeutic persona as a system instruction for Gemini.
# This guides the model's behavior and tone throughout the conversation.
THERAPIST_INSTRUCTION = {
    "role": "user",
    "parts": ["You are Numa, an empathetic and supportive AI therapist. Your goal is to listen, understand emotions, console users, and provide constructive ideas or coping strategies for life's challenges. Be non-judgmental, compassionate, and encourage self-reflection. Ask open-ended questions. Avoid giving medical advice or diagnosing. Always maintain a professional yet warm tone. Prioritize the user's well-being."]
}

# Initialize the generative model for the chatbot.
# The error "404 models/gemini-pro is not found" suggests the model name might be incorrect
# or not available for your API version/region.
# We'll try 'models/gemini-pro' as it's the standard full name.
# If this still fails, you MUST run list_available_gemini_models()
# to find the exact name for your setup (e.g., 'models/gemini-1.0-pro').
try:
    # --- CHANGE THIS LINE to the correct model name you found ---
    model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
    print(f"Gemini model initialized successfully using '{model.model_name}'.")
except Exception as e:
    print(f"Error initializing Gemini model with 'models/gemini-1.5-pro-latest': {e}")
    # Keep the fallback if you want, but it might not be needed if '1.5-pro-latest' works
    print("Trying 'models/gemini-1.5-pro' as a fallback...")
    try:
        model = genai.GenerativeModel('models/gemini-1.5-pro')
        print("Gemini model initialized successfully using 'models/gemini-1.5-pro'.")
    except Exception as e_fallback:
        print(f"Error initializing Gemini model with 'models/gemini-1.5-pro': {e_fallback}")
        print("Gemini AI is unavailable. Please check your API key, model name, and network.")
        model = None

# --- Backend Message Counter (for preventing excessive API calls) ---
# This dictionary stores message counts per user ID. It resets when the server restarts.
# For persistent storage, you would integrate a database (e.g., SQLite).
user_message_counts = {}
MAX_FREE_MESSAGES_PER_USER = 50 # Set your desired free message limit per user

# --- TEMPORARY DEBUGGING FUNCTION: Call this to list available models ---
# Run your Flask app once with this function called in __main__ to see available models.
# Then, update the `model = genai.GenerativeModel(...)` line above with the correct name,
# and you can comment out or remove this function and its call.
def list_available_gemini_models():
    print("\n--- Listing Available Gemini Models ---")
    try:
        for m in genai.list_models():
            # Only print models that support 'generateContent' for text generation
            if 'generateContent' in m.supported_generation_methods:
                print(f"Name: {m.name}, Supported Methods: {m.supported_generation_methods}")
        print("------------------------------------\n")
    except Exception as e:
        print(f"Error listing models: {e}. Check your API key and network connection.")
# --- END TEMPORARY DEBUGGING FUNCTION ---


@app.route('/api/chat/send_message', methods=['POST'])
def send_message():
    data = request.json
    user_message = data.get('message')
    conversation_history = data.get('history', [])
    user_id = data.get('userId') # Get user_id from frontend for tracking

    if not user_message:
        return jsonify({"response": "Please send a message."})

    # Check if the Gemini model was successfully initialized
    if not model:
        return jsonify({"response": "Numa is currently unavailable. Please try again later. (AI model not loaded)"})

    # --- Message Limit Check ---
    if user_id:
        current_count = user_message_counts.get(user_id, 0)
        if current_count >= MAX_FREE_MESSAGES_PER_USER:
            print(f"User {user_id} has reached message limit ({MAX_FREE_MESSAGES_PER_USER}).")
            return jsonify({"response": "You've reached the maximum number of free messages. Please try again later or consider supporting Numa."})
    # --- End Message Limit Check ---


    # Prepare the conversation history for Gemini
    # Gemini expects a list of dictionaries with 'role' and 'parts'.
    # Roles must strictly alternate 'user' and 'model'.
    # The first 'user' part is often the system instruction.
    gemini_conversation_formatted = [THERAPIST_INSTRUCTION]

    # Convert frontend history format (sender: 'user/bot') to Gemini format (role: 'user/model')
    for msg in conversation_history:
        if msg['sender'] == 'user':
            gemini_conversation_formatted.append({"role": "user", "parts": [msg['text']]})
        elif msg['sender'] == 'bot':
            # Ensure the bot's role is 'model' for Gemini
            gemini_conversation_formatted.append({"role": "model", "parts": [msg['text']]})

    # Add the current user's message to the formatted history for this turn
    gemini_conversation_formatted.append({"role": "user", "parts": [user_message]})

    try:
        # Send the entire formatted conversation history to Gemini for context-aware generation.
        # This is suitable for multi-turn conversations.
        response = model.generate_content(gemini_conversation_formatted)
        bot_response = response.text

        # --- Increment message count after successful generation ---
        if user_id:
            user_message_counts[user_id] = user_message_counts.get(user_id, 0) + 1
            print(f"User {user_id} message count: {user_message_counts[user_id]}/{MAX_FREE_MESSAGES_PER_USER}")
        # --- End Increment ---

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Log the full error response from Gemini if available for detailed debugging
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"Gemini API raw error response: {e.response.text}")
        bot_response = "I'm sorry, Numa is feeling a bit under the weather right now and couldn't process that. Could you please try again later. (API Error)"

    return jsonify({"response": bot_response})


@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    token = request.json.get('token')
    if not token:
        return jsonify({"success": False, "message": "No token provided"}), 400

    # Verify the ID token with Google's API
    response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")

    if response.status_code == 200:
        user_info = response.json()
        # Verify the token's audience matches your GOOGLE_CLIENT_ID
        if user_info.get("aud") == GOOGLE_CLIENT_ID:
            user = {
                "id": user_info.get("sub"), # Google's unique user ID (important for tracking)
                "name": user_info.get("name"),
                "email": user_info.get("email"),
            }
            print(f"User authenticated: {user.get('name')} ({user.get('email')})")
            return jsonify({"success": True, "message": "Authentication successful", "user": user})
        else:
            print(f"Token audience mismatch. Expected: {GOOGLE_CLIENT_ID}, Got: {user_info.get('aud')}")
            return jsonify({"success": False, "message": "Invalid token audience"}), 401
    else:
        print(f"Token verification failed: {response.text} (Status: {response.status_code})")
        return jsonify({"success": False, "message": "Token verification failed"}), 401

if __name__ == '__main__':
    # --- IMPORTANT: Call this function ONCE to find your correct model name ---
    # After you find the correct model name (e.g., 'models/gemini-pro' or 'models/gemini-1.0-pro'),
    # update the `model = genai.GenerativeModel(...)` line above, and then
    # you can comment out or remove this call to `list_available_gemini_models()`.
    #list_available_gemini_models()

    app.run(debug=True)