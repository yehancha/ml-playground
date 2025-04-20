import React, { useState, useEffect } from 'react';

function HomePage() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      fetch(`${backendUrl}/api/hello`)
        .then(response => response.json())
        .then(data => setMessage(data.message))
        .catch(() => setMessage('Failed to fetch message'));
    } else {
      setMessage('Backend URL not configured.');
    }
  }, []);

  return (
    <div>
      <h1>Simple Next.js Frontend</h1>
      <p>{message}</p>
    </div>
  );
}

export default HomePage;