import React, { useState } from 'react';
import ChatHistory from '../components/ChatHistory';
import Form from '../components/Form';
import ModelSelection from '../components/ModelSelection';
import styles from '../styles/pages/index.module.css';

function HomePage() {
  const [messages, setMessages] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [conversationStarted, setConversationStarted] = useState(false);

  const sendMessage = async (userMessage) => {
    if (!selectedModel) {
      alert('Please select a model before sending a message.');
      return;
    }

    const userMessageObj = { actor: 'user', content: userMessage };
    const newMessages = [...messages, userMessageObj];
    setMessages(newMessages);
    
    if (!conversationStarted) {
      setConversationStarted(true);
    }
    
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
            conversationHistory: newMessages,
            modelName: selectedModel
          })
        });
        const data = await response.json();
        
        setMessages([...newMessages, data]);
      } catch (error) {
        console.log(error);
        setMessages([...newMessages, { actor: 'model', content: 'Failed to fetch message.' }]);
      }
    } else {
      setMessages([...newMessages, { actor: 'model', content: 'Backend URL not configured.' }]);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationStarted(false);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>LLM Playground</h1>
      <div className={styles.controlPanel}>
        <ModelSelection 
          onModelSelect={handleModelSelect} 
          selectedModel={selectedModel}
          disabled={conversationStarted}
        />
        {conversationStarted && (
          <button 
            onClick={startNewConversation}
            className={styles.newConversationButton}
          >
            New Conversation
          </button>
        )}
      </div>
      <ChatHistory messages={messages} />
      <Form onSubmit={sendMessage} />
    </div>
  );
}

export default HomePage;
