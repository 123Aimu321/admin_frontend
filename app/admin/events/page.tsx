// app/admin/events/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EventTable } from '@/components/admin/EventTable';
import { EventDetailsModal } from '@/components/modals/EventDetailsModal';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { adminApi, Event } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter, dateFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getEvents();
      setEvents(response || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'upcoming') {
        filtered = filtered.filter(event => new Date(event.event_date) >= today);
      } else if (dateFilter === 'past') {
        filtered = filtered.filter(event => new Date(event.event_date) < today);
      }
    }

    setFilteredEvents(filtered);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleApproveEvent = async (eventId: number) => {
    try {
      // Note: You'll need to add this endpoint to your API
      // For now, we'll update locally
      setEvents(events.map(e => 
        e.event_id === eventId ? { ...e, status: 'approved' } : e
      ));
    } catch (error) {
      console.error('Failed to approve event:', error);
      alert('Failed to approve event. Please try again.');
    }
  };

  const handleRejectEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to reject this event?')) return;

    try {
      // Note: You'll need to add this endpoint to your API
      // For now, we'll update locally
      setEvents(events.map(e => 
        e.event_id === eventId ? { ...e, status: 'rejected' } : e
      ));
    } catch (error) {
      console.error('Failed to reject event:', error);
      alert('Failed to reject event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      // Note: You'll need to add this endpoint to your API
      // For now, we'll update locally
      setEvents(events.filter(e => e.event_id !== eventId));
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleRefresh = () => {
    loadEvents();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-2">Manage all events in your school</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleRefresh}>
            Refresh
          </Button>
          <a href="/admin/events/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </a>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            <div>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Events List</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EventTable
            events={filteredEvents}
            loading={loading}
            onViewDetails={handleViewDetails}
            onApprove={handleApproveEvent}
            onReject={handleRejectEvent}
            onDelete={handleDeleteEvent}
          />
        </CardContent>
      </Card>

      {/* Calendar View (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Calendar View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Calendar view coming soon!</p>
              <p className="text-sm text-gray-400 mt-2">
                This will show a visual calendar of all events
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
        />
      )}
    </div>
  );
}