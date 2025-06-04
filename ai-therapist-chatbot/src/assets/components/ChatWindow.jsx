// src/assets/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble'; // Correct path: in the same folder
import MessageInput from './MessageInput';   // Correct path: in the same folder
import '../../App.css'; // Correct path: App.css is in src/

// --- NEW: Define a maximum number of free messages ---
// This is a client-side limit to help prevent excessive API calls.
// Adjust this number based on your desired free tier usage and Gemini's actual free tier limits.
const MAX_FREE_MESSAGES = 15; // For example, allow 50 user messages per session

const ChatWindow = ({ loggedInUser, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Effect to add an initial welcome message when the user logs in
  useEffect(() => {
    if (loggedInUser && messages.length === 0) {
      setMessages([{
        sender: 'bot',
        text: `Hi ${loggedInUser.name}, I'm Numa. I'm here to listen and support you. How can I help you today?`
      }]);
    }
  }, [loggedInUser, messages.length]); // Dependencies ensure it runs when user logs in and messages are empty

  // Effect to scroll to the latest message whenever messages state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return; // Prevent sending empty messages

    // --- NEW: Check message limit before sending ---
    // Count only user-sent messages towards the limit
    const userMessageCount = messages.filter(msg => msg.sender === 'user').length;

    if (userMessageCount >= MAX_FREE_MESSAGES) {
      // If limit is reached, add a message to the chat and stop
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: `You've reached the maximum number of free messages (${MAX_FREE_MESSAGES}) for this session. Please try again later or consider supporting Numa.` }
      ]);
      return; // Crucially, exit the function to prevent API call
    }
    // --- END NEW: Check message limit ---


    // Add the new user message to the display immediately
    const newUserMessage = { sender: 'user', text: messageText };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsTyping(true); // Show typing indicator while waiting for bot's response

    try {
      // Prepare the conversation history to send to the backend.
      // We map the existing messages into a format the backend can process.
      // The initial welcome message (sender: 'bot') is also included in history.
      const historyToSend = messages.slice(0).map(msg => ({ // Create a shallow copy
        sender: msg.sender,
        text: msg.text
      }));
      // Add the newly sent user message to the history for this specific API call context
      historyToSend.push(newUserMessage);

      // Make the API call to your Flask backend
      const response = await fetch('http://127.0.0.1:5000/api/chat/send_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          history: historyToSend, // Send the entire conversation history for context
          userId: loggedInUser ? loggedInUser.id : null // Send user ID for backend tracking/limits
        }),
      });

      // Handle non-OK HTTP responses (e.g., 400, 500)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response from the backend
      const data = await response.json();
      const botResponse = { sender: 'bot', text: data.response };
      setMessages((prevMessages) => [...prevMessages, botResponse]); // Add bot's response to messages

    } catch (error) {
      // Log any errors during the API call
      console.error('Error sending message:', error);
      // Display a user-friendly error message in the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: "I'm sorry, Numa is feeling a bit under the weather right now and couldn't process that. Could you please try again." }
      ]);
    } finally {
      setIsTyping(false); // Hide typing indicator regardless of success or failure
    }
  };

  // Determine if the MessageInput should be disabled
  const isMessageInputDisabled = messages.filter(msg => msg.sender === 'user').length >= MAX_FREE_MESSAGES;


  return (
    <div className="chat-container">
      <div className="chat-header">
        Numa - Your AI Therapist
        {loggedInUser && (
          <button onClick={onLogout}>Logout</button>
        )}
      </div>
      <div className="messages-display">
        {/* Map through messages and render MessageBubble for each */}
        {messages.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender} text={msg.text} />
        ))}
        {/* Show typing indicator if bot is typing */}
        {isTyping && <MessageBubble sender="bot" text="Numa is typing..." isTyping={true} />}
        {/* This div is the target for auto-scrolling to the latest message */}
        <div ref={messagesEndRef} />
      </div>
      {/* Pass onSendMessage function and the new isDisabled prop to MessageInput */}
      <MessageInput onSendMessage={handleSendMessage} isDisabled={isMessageInputDisabled} />
    </div>
  );
};

export default ChatWindow;