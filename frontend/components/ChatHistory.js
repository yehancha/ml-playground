import React from 'react';
import Message from './Message';
import styles from '../styles/components/ChatHistory.module.css';

const ChatHistory = ({ messages }) => {
  return (
    <div className={styles.chatHistory}>
      {messages.length === 0 ? (
        <p className={styles.emptyMessage}>No messages yet. Type something to start chatting!</p>
      ) : (
        messages.map((message, index) => (
          <Message key={index} message={message} />
        ))
      )}
    </div>
  );
};

export default ChatHistory;

