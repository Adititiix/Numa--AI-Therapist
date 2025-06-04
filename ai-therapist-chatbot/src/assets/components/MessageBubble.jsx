// src/components/MessageBubble.jsx
import React from 'react';
import '../../App.css'; // Import App.css for styling

const MessageBubble = ({ sender, text, isTyping }) => {
  const bubbleClassName = sender === 'user' ? 'user-message' : 'bot-message';

  return (
    <div className={`message-bubble ${bubbleClassName}`}>
      {isTyping ? (
        <p>...</p> // Simple typing indicator
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
};

export default MessageBubble;