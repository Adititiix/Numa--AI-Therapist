// src/assets/components/MessageInput.jsx
import React, { useState } from 'react';
import '../../App.css';

const MessageInput = ({ onSendMessage, isDisabled }) => { // Add isDisabled prop
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isDisabled) { // Check isDisabled before sending
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input-field"
        placeholder="Type your message..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={isDisabled} // Disable the input field
      />
      <button type="submit" className="send-button" disabled={isDisabled}>Send</button> {/* Disable the button */}
    </form>
  );
};

export default MessageInput;