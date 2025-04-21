import React, { useState } from 'react';
import Chat from '../components/Chat';
import ModelSelection from '../components/ModelSelection';
import ModelTypeSelection from '../components/ModelTypeSelection';
import Summarize from '../components/Summarize';
import styles from '../styles/pages/index.module.css';

const Home = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [isModelSelectionDisabled, setIsModelSelectionDisabled] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setIsModelSelectionDisabled(false);
  };

  const handleChatEvent = (event) => {
    switch (event) {
      case 'MESSAGE_SENT':
        setIsModelSelectionDisabled(true);
        break;
      case 'NEW_CONVERSATION':
        setIsModelSelectionDisabled(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <ModelTypeSelection 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
      
      <ModelSelection
        modelType={activeTab.toUpperCase()}
        selectedModel={selectedModel}
        onModelSelect={setSelectedModel}
        disabled={activeTab === 'chat' ? isModelSelectionDisabled : false}
      />

      <div className={styles.content}>
        {activeTab === 'chat' ? (
          <Chat
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            onChatEvent={handleChatEvent}
          />
        ) : (
          <Summarize
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
