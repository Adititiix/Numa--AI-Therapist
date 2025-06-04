# Numa - Your AI Therapist

Numa is an AI-powered conversational agent designed to provide initial support and a listening ear, focusing on well-being and mental health. This project is built as a full-stack application, with a React-based frontend and a Flask-powered Python backend.

---

## 🚀 Project Overview

This repository contains a monorepo setup for the Numa AI Therapist application, encompassing:

* **`ai-therapist-chatbot/` (Frontend):** The user interface built with React, providing a conversational chat experience.
* **`ai-therapist-backend/` (Backend):** The Flask API that handles user requests, interacts with the Google Gemini AI model, and manages application logic.

---

## ✨ Features

* **Interactive Chat Interface:** A clean and intuitive chat window for user interaction.
* **Gemini AI Integration:** Leverages the Google Gemini API (specifically `gemini-1.5-pro-latest` or `gemini-1.5-flash-latest`) for natural language understanding and generation.
* **Conversation Context:** The AI remembers past messages within a session to maintain context.
* **Client-Side Message Limiting:** Implements a frontend limit on free messages to help manage API quota usage during testing and free-tier interactions.
* **User Login (Placeholder):** Includes initial setup for user authentication (currently a placeholder for Google OAuth).

---

## 🛠️ Technologies Used

### Frontend (`ai-therapist-chatbot/`)

* **React:** A JavaScript library for building user interfaces.
* **Vite:** A fast build tool for modern web projects.
* **HTML/CSS:** Standard web technologies for structure and styling.

### Backend (`ai-therapist-backend/`)

* **Python:** The programming language for the backend logic.
* **Flask:** A lightweight Python web framework for building APIs.
* **Google Generative AI SDK (`google-generativelanguage`):** Python client library for interacting with the Gemini API.
* **`python-dotenv`:** For managing environment variables securely.
* **Flask-CORS:** For handling Cross-Origin Resource Sharing.

---

## ⚙️ Setup and Installation

Follow these steps to get Numa running on your local machine.

### Prerequisites

* Node.js (LTS recommended) and npm (comes with Node.js)
* Python 3.9+
* Git

### 1. Clone the Repository

First, clone this monorepo to your local machine:

 Backend Setup (ai-therapist-backend/)
Navigate to the backend directory:

Bash

cd ai-therapist-backend
Create a Python Virtual Environment:

Bash

python -m venv venv
Activate the Virtual Environment:

Windows (PowerShell):
PowerShell

.\venv\Scripts\Activate.ps1
Windows (Command Prompt):
DOS

venv\Scripts\activate.bat
macOS/Linux:
Bash

source venv/bin/activate
Install Python Dependencies:

Bash

pip install -r requirements.txt
(If requirements.txt is missing, you'll need to create it by running pip freeze > requirements.txt after installing dependencies manually, or list them if you know them: pip install Flask Flask-CORS google-generativelanguage python-dotenv google-auth google-auth-oauthlib google-api-python-client)

Set Up Environment Variables:
You need to set up your Google API Key for Gemini and your Google OAuth Client ID.

Go to Google AI Studio to get your Gemini API Key.
Go to Google Cloud Console to create OAuth 2.0 Client IDs.
Create a file named .env in the ai-therapist-backend/ directory. This file is in .gitignore and will NOT be uploaded to GitHub.
Add your keys to the .env file like this:
Code snippet

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
Replace YOUR_GOOGLE_CLIENT_ID_HERE and YOUR_GEMINI_API_KEY_HERE with your actual keys.
Run the Flask Backend:

Bash

flask run
The backend should start and be accessible at http://127.0.0.1:5000. Keep this terminal running.

3. Frontend Setup (ai-therapist-chatbot/)
Open a NEW terminal (keep the backend terminal running).

Navigate to the frontend directory:

Bash

cd ../ai-therapist-chatbot
Install Node.js Dependencies:

Bash

npm install
Run the React Frontend:

Bash

npm run dev
The frontend should start and typically open in your browser at http://localhost:5173/ (or similar).

🛑 Client-Side Message Limit
The frontend implements a MAX_FREE_MESSAGES constant (defaulting to 50 user messages) in src/assets/components/ChatWindow.jsx. Once this limit is reached, the chat input will be disabled, and a message will be displayed, preventing further API calls from the client side during a single session. This is designed to help manage free-tier API usage.

🔒 Security Notes
API Keys & Sensitive Data: API keys and other sensitive information are loaded via environment variables (.env file) and are explicitly excluded from Git history using .gitignore. Never hardcode your keys directly into your code.
Git History Clean-up: This repository's history has been cleaned using BFG Repo-Cleaner to remove any accidental past commits of sensitive data.

