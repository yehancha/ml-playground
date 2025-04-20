import React, { useState } from 'react';
import ChatHistory from '../components/ChatHistory';
import Form from '../components/Form';
import styles from '../styles/pages/index.module.css';

function HomePage() {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (userMessage) => {
    const userMessageObj = { actor: 'user', content: userMessage };
    const newMessages = [...messages, userMessageObj];
    setMessages(newMessages);
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      try {
        const response = await fetch(`${backendUrl}/api/prompt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            content: userMessage,
            conversationHistory: newMessages
          })
        });
        const data = await response.json();
        
        setMessages([...newMessages, data]);
      } catch (error) {
        setMessages([...newMessages, { actor: 'model', content: 'Failed to fetch message' }]);
      }
    } else {
      setMessages([...newMessages, { actor: 'model', content: 'Backend URL not configured.' }]);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>LLM Playground</h1>
      <ChatHistory messages={messages} />
      <Form onSubmit={sendMessage} />
    </div>
  );
}

export default HomePage;
