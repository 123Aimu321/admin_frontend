// app/admin/database/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DatabaseStatusCard } from '@/components/admin/DatabaseStatusCard';
import { 
  Database, 
  Server, 
  HardDrive, 
  Activity,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { adminApi } from '@/api/admin';

export default function DatabasePage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDatabaseStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDatabaseStatus = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSystemStatus();
      setStatus(response);
      
      // Mock metrics - replace with actual API call
      setMetrics({
        uptime: '99.9%',
        responseTime: '45ms',
        connections: 128,
        queriesPerSecond: 2450,
        storageUsed: '15.8 GB',
        totalStorage: '100 GB',
        lastBackup: '2024-01-30 02:00:00',
        backupSize: '2.1 GB',
      });

      // Mock backups list
      setBackups([
        { id: 1, name: 'Full Backup', date: '2024-01-30 02:00:00', size: '2.1 GB', status: 'success' },
        { id: 2, name: 'Incremental Backup', date: '2024-01-29 02:00:00', size: '450 MB', status: 'success' },
        { id: 3, name: 'Full Backup', date: '2024-01-28 02:00:00', size: '2.0 GB', status: 'success' },
        { id: 4, name: 'Incremental Backup', date: '2024-01-27 02:00:00', size: '420 MB', status: 'failed' },
      ]);

    } catch (error) {
      console.error('Failed to load database status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    if (!confirm('This will create a new database backup. Continue?')) return;

    try {
      // Call backup API endpoint
      alert('Backup started... This may take a few minutes.');
      // Refresh status after backup
      setTimeout(loadDatabaseStatus, 5000);
    } catch (error) {
      console.error('Failed to start backup:', error);
      alert('Failed to start backup. Please try again.');
    }
  };

  const handleOptimize = async () => {
    if (!confirm('This will optimize the database tables. Continue?')) return;

    try {
      // Call optimize API endpoint
      alert('Database optimization started...');
      setTimeout(loadDatabaseStatus, 3000);
    } catch (error) {
      console.error('Failed to optimize database:', error);
      alert('Failed to optimize database. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'backups', label: 'Backups', icon: HardDrive },
    { id: 'settings', label: 'Settings', icon: Server },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your school database</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadDatabaseStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleBackup}>
            <Download className="h-4 w-4 mr-2" />
            Backup Now
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Database Status</CardTitle>
            <div className="flex items-center space-x-2">
              {status?.overall === 'healthy' ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  All Systems Operational
                </span>
              ) : status?.overall === 'degraded' ? (
                <span className="flex items-center text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Performance Issues
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  System Issues
                </span>
              )}
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DatabaseStatusCard
              title="Database Server"
              status={status?.database || 'unknown'}
              value={metrics?.responseTime || 'N/A'}
              subtitle="Response Time"
              icon={Server}
            />
            <DatabaseStatusCard
              title="Storage"
              status={status?.storage || 'unknown'}
              value={metrics?.storageUsed || 'N/A'}
              subtitle={`of ${metrics?.totalStorage || 'N/A'}`}
              icon={HardDrive}
            />
            <DatabaseStatusCard
              title="Active Connections"
              status={status?.connections || 'unknown'}
              value={metrics?.connections || 'N/A'}
              subtitle="Current connections"
              icon={Activity}
            />
            <DatabaseStatusCard
              title="Uptime"
              status="healthy"
              value={metrics?.uptime || 'N/A'}
              subtitle="This month"
              icon={CheckCircle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 animate-pulse rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Database optimized</p>
                        <p className="text-sm text-gray-500">2 minutes ago</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium">Daily backup completed</p>
                        <p className="text-sm text-gray-500">Today, 02:00 AM</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium">Query optimization</p>
                        <p className="text-sm text-gray-500">Yesterday, 11:30 PM</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={handleOptimize}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Optimize Tables
                </Button>
                <Button
                  onClick={() => setActiveTab('backups')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  View Backup History
                </Button>
                <Button
                  onClick={() => alert('Coming soon!')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Run Diagnostic Test
                </Button>
                <Button
                  onClick={() => alert('Coming soon!')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Server className="h-4 w-4 mr-2" />
                  View Query Logs
                </Button>
              </div>

              {/* Storage Warning */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-800">Storage Alert</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Database storage is at 85%. Consider cleaning up old data or increasing storage capacity.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'backups' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Backup History</CardTitle>
              <Button size="sm" onClick={handleBackup}>
                <Download className="h-4 w-4 mr-2" />
                Create New Backup
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Size</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                        <td className="py-3 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-40"></div></td>
                        <td className="py-3 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                        <td className="py-3 px-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                        <td className="py-3 px-4"><div className="h-8 bg-gray-200 animate-pulse rounded w-24"></div></td>
                      </tr>
                    ))
                  ) : backups.length > 0 ? (
                    backups.map((backup) => (
                      <tr key={backup.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{backup.name}</td>
                        <td className="py-3 px-4 text-sm">{backup.date}</td>
                        <td className="py-3 px-4 text-sm">{backup.size}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            backup.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getStatusIcon(backup.status)}
                            <span className="ml-1">{backup.status === 'success' ? 'Success' : 'Failed'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Restore
                            </Button>
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No backups found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance tab would go here */}
      {/* Settings tab would go here */}
    </div>
  );
}