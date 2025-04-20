import React, { useState } from 'react';
import styles from '../styles/components/Form.module.css';

const Form = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      onSubmit(trimmedInput);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmedInput = inputValue.trim();
      if (trimmedInput) {
        onSubmit(trimmedInput);
        setInputValue('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className={styles.input}
      />
      <button 
        type="submit" 
        disabled={!inputValue.trim()}
        className={`${styles.button} ${!inputValue.trim() ? styles.buttonDisabled : ''}`}
      >
        Send
      </button>
    </form>
  );
};

export default Form;

