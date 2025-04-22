import React, { useState } from 'react';
import Chat from '../components/Chat';
import Logs from '../components/Logs';
import ModelSelection from '../components/ModelSelection';
import ModelTypeSelection from '../components/ModelTypeSelection';
import Summarize from '../components/Summarize';
import styles from '../styles/pages/index.module.css';

const Home = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [isModelSelectionDisabled, setIsModelSelectionDisabled] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const handleTabChange = (newTab) => {
    // When switching between model types, reset the selected model
    if (activeTab !== newTab && newTab !== 'logs' && activeTab !== 'logs') {
      setSelectedModel('');
    }

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

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <Chat
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            onChatEvent={handleChatEvent}
          />
        );
      case 'summarize':
        return (
          <Summarize
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
        );
      case 'logs':
        return <Logs />;
      default:
        return null; // Or perhaps a default component or message
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>ML Playground</h1>
        <ModelTypeSelection
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {activeTab !== 'logs' && (
        <ModelSelection
          modelType={activeTab.toUpperCase()}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          disabled={activeTab === 'chat' ? isModelSelectionDisabled : false}
        />
      )}

      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Home;