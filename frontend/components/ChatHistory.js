import React, { useRef, useEffect } from 'react';
import Message from './Message';
import styles from '../styles/components/ChatHistory.module.css';

const ChatHistory = ({ messages }) => {
  const chatHistoryRef = useRef(null);
  
  useEffect(() => {
    if (chatHistoryRef.current && messages.length > 0) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div className={styles.chatHistory} ref={chatHistoryRef}>
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

