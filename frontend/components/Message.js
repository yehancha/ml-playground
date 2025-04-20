import React from 'react';
import styles from '../styles/components/Message.module.css';

const Message = ({ message }) => {
  const isUser = message.actor === 'user';
  
  return (
    <div className={`${styles.messageContainer} ${isUser ? styles.userMessage : styles.modelMessage}`}>
      <div className={styles.messageBubble}>
        {message.content}
      </div>
    </div>
  );
};

export default Message;

