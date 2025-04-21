import React, { useState } from 'react';
import styles from '../styles/components/Summarize.module.css';

const Summarize = ({ selectedModel }) => {
  const [originalText, setOriginalText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSummarize = async () => {
    if (!selectedModel) {
      alert('Please select a model before summarizing text.');
      return;
    }

    if (!originalText.trim()) {
      alert('Please enter some text to summarize.');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      setError('API URL not configured');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/process/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText,
          modelName: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setSummary(data.summary || data.content || 'No summary returned.');
    } catch (err) {
      console.error('Error summarizing text:', err);
      setError(err.message || 'Failed to summarize text.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOriginalText('');
    setSummary('');
    setError(null);
  };

  return (
    <div className={styles.summarizeContainer}>
      <div className={styles.inputSection}>
        <h2 className={styles.sectionTitle}>Original Text</h2>
        <textarea
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="Enter or paste the text you want to summarize..."
          className={styles.textInput}
          disabled={loading}
        />
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={handleSummarize}
          disabled={loading || !originalText.trim()}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
        
        <button
          onClick={handleClear}
          disabled={loading}
          className={styles.button}
        >
          Clear
        </button>
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      )}

      {summary && (
        <div className={styles.resultSection}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <div className={styles.summaryResult}>
            {summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default Summarize;
