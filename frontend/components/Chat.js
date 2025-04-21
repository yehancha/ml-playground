import React, { useState } from 'react';
import ChatHistory from './ChatHistory';
import Form from './Form';
import styles from '../styles/components/Chat.module.css';

const Chat = ({ selectedModel, onChatEvent }) => {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (userMessage) => {
    if (!selectedModel) {
      alert('Please select a model before sending a message.');
      return;
    }

    const userMessageObj = { actor: 'user', content: userMessage };
    const newMessages = [...messages, userMessageObj];
    setMessages(newMessages);
    
    onChatEvent('MESSAGE_SENT');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/process/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userMessage,
            conversationHistory: newMessages,
            modelName: selectedModel
          })
        });
        const data = await response.json();
        
        setMessages([...newMessages, data]);
      } catch (error) {
        setMessages([...newMessages, { actor: 'model', content: 'Failed to fetch message.' }]);
      }
    } else {
      setMessages([...newMessages, { actor: 'model', content: 'Backend URL not configured.' }]);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    onChatEvent('NEW_CONVERSATION');
  };

  return (
    <div className={styles.chatContainer}>
      <ChatHistory messages={messages} />
      <div className={styles.controlPanel}>
        <Form onSubmit={sendMessage} />
        <button 
          onClick={startNewConversation}
          className={styles.newConversationButton}
          disabled={messages.length === 0}
        >
          New Conversation
        </button>
      </div>
    </div>
  );
};

export default Chat;

