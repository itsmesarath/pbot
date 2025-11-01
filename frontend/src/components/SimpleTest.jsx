import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SimpleTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        setStatus('Fetching data from Binance...');
        console.log('🔍 Starting Binance API test...');
        
        const response = await axios.get('https://api.binance.com/api/v3/klines', {
          params: {
            symbol: 'BTCUSDT',
            interval: '5m',
            limit: 10
          }
        });

        console.log('✅ API Response:', response.data);
        setData(response.data);
        setStatus('✅ Success! Binance API is working');
      } catch (err) {
        console.error('❌ API Error:', err);
        setError(err.message);
        setStatus('❌ Failed to fetch data');
      }
    };

    testAPI();
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-6 m-4">
      <h2 className="text-2xl font-bold text-white mb-4">🧪 Binance API Test</h2>
      
      <div className="mb-4">
        <div className={`text-lg font-semibold ${
          status.includes('✅') ? 'text-green-400' : 
          status.includes('❌') ? 'text-red-400' : 
          'text-yellow-400'
        }`}>
          {status}
        </div>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded p-4 mb-4">
          <div className="text-red-400 font-bold">Error Details:</div>
          <div className="text-white text-sm mt-2">{error}</div>
        </div>
      )}

      {data && (
        <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded p-4">
          <div className="text-green-400 font-bold mb-2">Data Received:</div>
          <div className="text-white text-sm">
            <div>✅ Candles: {data.length}</div>
            <div>✅ Latest Price: ${parseFloat(data[data.length - 1][4]).toFixed(2)}</div>
            <div>✅ Volume: {parseFloat(data[data.length - 1][5]).toFixed(2)}</div>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
              Show raw data
            </summary>
            <pre className="mt-2 bg-gray-900 rounded p-3 text-xs overflow-auto max-h-64">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-400">
        <div className="mb-2">💡 What this tests:</div>
        <ul className="list-disc ml-6 space-y-1">
          <li>Can browser access Binance API?</li>
          <li>Is CORS working correctly?</li>
          <li>Can axios make requests?</li>
          <li>Is data format correct?</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleTest;
