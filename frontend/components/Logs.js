import React, { useState, useEffect } from 'react';
import styles from '../styles/components/Logs.module.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3020/api/query', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setLogs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to fetch logs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  };

  const formatJSON = (jsonData) => {
    if (!jsonData) return 'N/A';
    try {
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      return JSON.stringify(parsedData, null, 2);
    } catch (err) {
      console.error('Error formatting JSON:', err);
      return String(jsonData);
    }
  };


  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {logs.length === 0 ? (
        <p className={styles.noLogs}>No logs found.</p>
      ) : (
        <div className={styles.logsContainer}>
          {logs.data.map((log, index) => (
            <div key={log._id || index} className={styles.logCard}>
              {/* Metadata Column */}
              <div className={styles.metadataColumn}>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Timestamp</span>
                  <span className={styles.metadataValue}>{formatTimestamp(log.timestamp)}</span>
                </div>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Endpoint</span>
                  <span className={styles.metadataValue}>{log.endpoint || 'N/A'}</span>
                </div>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Model</span>
                  <span className={styles.metadataValue}>{log.model || 'N/A'}</span>
                </div>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Response Time</span>
                  <span className={styles.metadataValue}>{log.responseTimeMs ? `${log.responseTimeMs} ms` : 'N/A'}</span>
                </div>
              </div>
              
              {/* Data Column */}
              <div className={styles.dataColumn}>
                <div className={styles.jsonSection}>
                  <span className={styles.jsonLabel}>Input</span>
                  <div className={styles.jsonContainer}>
                    <pre className={styles.jsonPre}>{formatJSON(log.input)}</pre>
                  </div>
                </div>
                
                <div className={styles.jsonSection}>
                  <span className={styles.jsonLabel}>Output</span>
                  <div className={styles.jsonContainer}>
                    <pre className={styles.jsonPre}>{formatJSON(log.output)}</pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Logs;
