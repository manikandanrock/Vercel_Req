// ChatContext.js
import React, { createContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Store messages as an object with project IDs as keys
  const [messagesByProject, setMessagesByProject] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : {};
  });

  // Update localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messagesByProject));
  }, [messagesByProject]);

  // Get messages for a specific project
  const getMessages = (projectId) => {
    return messagesByProject[projectId] || [];
  };

  // Set messages for a specific project
  const setMessages = (projectId, newMessages) => {
    setMessagesByProject((prev) => ({
      ...prev,
      [projectId]: newMessages,
    }));
  };

  // Clear messages for a specific project
  const clearMessages = (projectId) => {
    setMessagesByProject((prev) => {
      const updated = { ...prev };
      delete updated[projectId];
      return updated;
    });
  };

  return (
    <ChatContext.Provider value={{ getMessages, setMessages, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
