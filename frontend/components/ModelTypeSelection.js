import React from 'react';
import styles from '../styles/components/ModelTypeSelection.module.css';

const ModelTypeSelection = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.modelTypeContainer}>
      <button
        className={`${styles.typeButton} ${activeTab === 'chat' ? styles.active : ''}`}
        onClick={() => onTabChange('chat')}
      >
        Chat
      </button>

      <button
        className={`${styles.typeButton} ${activeTab === 'summarize' ? styles.active : ''}`}
        onClick={() => onTabChange('summarize')}
      >
        Summarize
      </button>
      
      <button
        className={`${styles.logsButton} ${activeTab === 'logs' ? styles.active : ''}`}
        onClick={() => onTabChange('logs')}
      >
        Logs
      </button>
    </div>
  );
};

export default ModelTypeSelection;

