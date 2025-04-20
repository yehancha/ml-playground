import React, { useEffect, useState } from 'react';
import styles from '../styles/components/ModelSelection.module.css';

const ModelSelection = ({ onModelSelect, selectedModel, disabled }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch available models when component mounts
    const fetchModels = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error('Backend URL not configured');
        }

        const response = await fetch(`${backendUrl}/api/models`);
        
        if (!response.ok) {
          throw new Error(`Error fetching models: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.availableModels && Array.isArray(data.availableModels)) {
          setModels(data.availableModels);
          
          if (!selectedModel && data.availableModels.length > 0) {
            onModelSelect(data.availableModels[0]);
          }
        } else {
          throw new Error('No models returned from API');
        }
      } catch (err) {
        console.error('Error fetching models:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [onModelSelect, selectedModel]);

  const handleModelChange = (e) => {
    onModelSelect(e.target.value);
  };

  return (
    <div className={styles.modelSelectionContainer}>
      <label className={styles.modelLabel}>
        Model:
        <select 
          value={selectedModel || ''} 
          onChange={handleModelChange} 
          disabled={disabled || loading}
          className={styles.modelSelect}
        >
          {models.length === 0 && (
            <option value="" disabled>
              {loading ? 'Loading models...' : 'No models available'}
            </option>
          )}
          
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </label>
      
      {error && (
        <div className={styles.error}>
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default ModelSelection;

