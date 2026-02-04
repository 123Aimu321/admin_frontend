'use client';

import { useEffect, useState } from 'react';
import { api } from '@/api/axios';

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const testResults = [];
    
    // Test various endpoints
    const endpoints = [
      { url: '/', method: 'GET', auth: false },
      { url: '/health', method: 'GET', auth: false },
      { url: '/admin/users/1', method: 'GET', auth: true },
      { url: '/users/1', method: 'GET', auth: true },
      { url: '/api/admin/users/1', method: 'GET', auth: true },
      { url: '/auth/login', method: 'POST', auth: false, data: { username: 'test', password: 'test' } },
    ];

    for (const endpoint of endpoints) {
      try {
        const config: any = {};
        if (endpoint.auth) {
          const token = localStorage.getItem('access_token');
          if (!token) {
            testResults.push({
              endpoint: endpoint.url,
              status: '⚠️ No token',
              data: 'Authentication required'
            });
            continue;
          }
          config.headers = { Authorization: `Bearer ${token}` };
        }

        let response;
        if (endpoint.method === 'GET') {
          response = await api.get(endpoint.url, config);
        } else {
          response = await api.post(endpoint.url, endpoint.data, config);
        }

        testResults.push({
          endpoint: endpoint.url,
          status: `✅ ${response.status}`,
          data: response.data
        });
      } catch (error: any) {
        testResults.push({
          endpoint: endpoint.url,
          status: `❌ ${error.response?.status || 'Error'}`,
          data: error.response?.data || error.message
        });
      }
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    testEndpoints();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">API Endpoint Debug</h1>
        
        <div className="mb-6">
          <button
            onClick={testEndpoints}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test All Endpoints'}
          </button>
          <p className="mt-2 text-sm text-gray-600">
            Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL}
          </p>
          <p className="text-sm text-gray-600">
            Token: {localStorage.getItem('access_token') ? 'Present' : 'Missing'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {result.endpoint}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status.includes('✅') ? 'bg-green-100 text-green-800' :
                      result.status.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Check if backend is running on port 8000</li>
            <li>Verify CORS is configured in backend</li>
            <li>Check admin router prefix in main.py</li>
            <li>Make sure you're logged in (token exists)</li>
            <li>Check browser console for detailed errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}