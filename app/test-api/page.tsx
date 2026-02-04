'use client';

import { useEffect, useState } from 'react';
import { api } from '@/api/axios';

export default function ApiTestPage() {
  const [status, setStatus] = useState('Testing...');
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    testAllEndpoints();
  }, []);

  const testAllEndpoints = async () => {
    try {
      const token = localStorage.getItem('access_token');
      setToken(token);
      
      // Test base endpoint
      const baseRes = await api.get('/');
      setStatus(`API Connected: ${baseRes.data.message}`);
      
      // Test with school_id (you need to be logged in)
      if (token) {
        try {
          const usersRes = await api.get('/admin/users/1');
          setEndpoints(prev => [...prev, {
            endpoint: '/admin/users/1',
            status: '✅ Success',
            data: usersRes.data
          }]);
        } catch (error) {
          setEndpoints(prev => [...prev, {
            endpoint: '/admin/users/1',
            status: '❌ Failed',
            error: (error as any).message
          }]);
        }
        
        try {
          const classesRes = await api.get('/admin/classes/1');
          setEndpoints(prev => [...prev, {
            endpoint: '/admin/classes/1',
            status: '✅ Success',
            data: classesRes.data
          }]);
        } catch (error) {
          setEndpoints(prev => [...prev, {
            endpoint: '/admin/classes/1',
            status: '❌ Failed',
            error: (error as any).message
          }]);
        }
        
        try {
          const subjectsRes = await api.get('/admin/subjects/1');
          setEndpoints(prev => [...prev, {
            endpoint: '/admin/subjects/1',
            status: '✅ Success',
            data: subjectsRes.data
          }]);
        } catch (error) {
          setEndpoints(prev => [...prev, {
            endpoint: '/admin/subjects/1',
            status: '❌ Failed',
            error: (error as any).message
          }]);
        }
      }
    } catch (error) {
      setStatus(`❌ API Connection Failed: ${(error as any).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">API Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className={`p-4 rounded-lg ${status.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-medium">{status}</p>
            <p className="text-sm mt-2">Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
            <p className="text-sm">Token: {token ? 'Present' : 'Missing'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Endpoint Tests</h2>
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{endpoint.endpoint}</code>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${endpoint.status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {endpoint.status}
                  </span>
                </div>
                {endpoint.data && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Data: {Array.isArray(endpoint.data) ? `${endpoint.data.length} items` : 'Object'}</p>
                    {Array.isArray(endpoint.data) && endpoint.data.length > 0 && (
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(endpoint.data.slice(0, 2), null, 2)}
                      </pre>
                    )}
                  </div>
                )}
                {endpoint.error && (
                  <p className="mt-2 text-sm text-red-600">Error: {endpoint.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={testAllEndpoints}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Test Again
          </button>
        </div>
      </div>
    </div>
  );
}