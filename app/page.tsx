"use client"
import { useState, useEffect } from 'react';

export default function TournamentDisplay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sheets');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const sheetData = await response.json();
        setData(sheetData);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchData, 10000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="loading">Loading tournament data...</div>;
  
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="tournament-container">
      <div className="header">
        <h1>Tournament Bracket</h1>
        <div className="last-updated">Last updated: {lastUpdated}</div>
      </div>
      
      <div className="bracket">
        {data.length > 0 ? (
          // This is a simple table - replace with your actual bracket visualization
          <table>
            <thead>
              <tr>
                {data[0].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data available</div>
        )}
      </div>
      
      <style jsx>{`
        .tournament-container {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .last-updated {
          font-size: 14px;
          color: #666;
        }
        
        .bracket {
          width: 100%;
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .loading, .error {
          text-align: center;
          padding: 50px;
          font-size: 18px;
        }
        
        .error {
          color: #d32f2f;
        }
      `}</style>
    </div>
  );
}