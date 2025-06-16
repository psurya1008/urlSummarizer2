// App.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setError('');
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/summarize', { url });
      setResults((prev) => [response.data, ...prev]);
      setUrl('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>🔍 URL Summarizer</h1> 

      <div className="input-card">
        <input
          type="text"
          placeholder="Paste a public URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={handleSummarize} disabled={loading}>
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="results-container">
        {results.length > 0 ? (
          results.map((item, index) => (
            <div className="result-card" key={index}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.url}
              </a>
              <p className="summary">{item.summary}</p>
              <ul className="key-points">
                {item.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="note">No summaries yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
