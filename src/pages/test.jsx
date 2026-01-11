// src/components/TestConnection.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const TestConnection = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get('/auth/test');
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) return <div>Testing connection...</div>;
  if (error) return <div className="text-red-600">Connection failed: {error}</div>;
  
  return (
    <div className="text-green-600">
      Connection successful! Response: {JSON.stringify(data)}
    </div>
  );
};

export default TestConnection;