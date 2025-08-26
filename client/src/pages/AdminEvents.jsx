import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/admin/events?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewRegistrations = async (event) => {
    try {
      setSelectedEvent(event);
      setRegistrations(event.registrations || []);
      setSelectedAttendees([]);
      setShowRegistrations(true);
    } catch (error) {
      console.error('Error viewing registrations:', error);
    }
  };

  const handleAttendeeSelection = (userId) => {
    setSelectedAttendees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const markAttendance = async () => {
    if (!selectedEvent || selectedAttendees.length === 0) {
      alert('Please select at least one attendee');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/admin/${selectedEvent.id}/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedAttendees
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setShowRegistrations(false);
        fetchEvents(); // Refresh events list
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance');
    }
  };

  const completeEvent = async (eventId, markAllAsAttended = false) => {
    try {
      const token = localStorage.getItem('token');
      const body = markAllAsAttended ? {} : { attendeeIds: selectedAttendees };
      
      const response = await fetch(`/api/events/admin/${eventId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setShowRegistrations(false);
        fetchEvents(); // Refresh events list
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to complete event');
      }
    } catch (error) {
      console.error('Error completing event:', error);
      alert('Error completing event');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Event Management</h1>
          
          {/* Status Filter */}
          <div className="flex space-x-4 mb-6">
            <Button
              onClick={() => setStatusFilter('all')}
              variant={statusFilter === 'all' ? 'primary' : 'secondary'}
            >
              All Events
            </Button>
            <Button
              onClick={() => setStatusFilter('active')}
              variant={statusFilter === 'active' ? 'primary' : 'secondary'}
            >
              Active Events
            </Button>
            <Button
              onClick={() => setStatusFilter('completed')}
              variant={statusFilter === 'completed' ? 'primary' : 'secondary'}
            >
              Completed Events
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                <p className="text-blue-600 font-medium">{event.points_reward} points</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.is_active ? 'Active' : 'Completed'}
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Registrations</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="block font-semibold text-blue-600">{event.total_registrations}</span>
                    <span className="text-gray-500">Total</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-orange-600">{event.pending_registrations}</span>
                    <span className="text-gray-500">Pending</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-green-600">{event.completed_registrations}</span>
                    <span className="text-gray-500">Attended</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => viewRegistrations(event)}
                  className="w-full"
                  variant="secondary"
                >
                  View Registrations
                </Button>
                
                {event.is_active && event.total_registrations > 0 && (
                  <Button
                    onClick={() => completeEvent(event.id, true)}
                    className="w-full"
                    variant="primary"
                  >
                    Mark All as Completed
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found for the selected filter.</p>
          </div>
        )}

        {/* Registration Modal */}
        {showRegistrations && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Registrations for: {selectedEvent.title}
                </h2>
                <div className="flex space-x-6 text-sm text-gray-600">
                  <span>Total: {registrations.length}</span>
                  <span>Pending: {registrations.filter(r => r.registration_status === 'registered').length}</span>
                  <span>Attended: {registrations.filter(r => r.registration_status === 'attended').length}</span>
                </div>
              </div>

              <div className="p-6">
                {registrations.length > 0 ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Select attendees to mark as attended:</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {registrations
                          .filter(reg => reg.registration_status === 'registered')
                          .map((registration) => (
                          <label key={registration.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={selectedAttendees.includes(registration.user_id)}
                              onChange={() => handleAttendeeSelection(registration.user_id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {registration.first_name} {registration.last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {registration.email} • ID: {registration.student_id}
                              </p>
                              <p className="text-xs text-gray-500">
                                Registered: {formatDate(registration.registered_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                registration.registration_status === 'attended' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {registration.registration_status}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {registrations.filter(r => r.registration_status === 'attended').length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Already Attended:</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {registrations
                            .filter(reg => reg.registration_status === 'attended')
                            .map((registration) => (
                            <div key={registration.id} className="p-3 bg-green-50 rounded-lg">
                              <p className="font-medium text-gray-900">
                                {registration.first_name} {registration.last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Points awarded: {registration.points_awarded}
                              </p>
                              <p className="text-xs text-gray-500">
                                Attended: {formatDate(registration.attended_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">No registrations found for this event.</p>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
                <Button
                  onClick={() => setShowRegistrations(false)}
                  variant="secondary"
                >
                  Close
                </Button>
                {selectedAttendees.length > 0 && (
                  <Button
                    onClick={markAttendance}
                    variant="primary"
                  >
                    Mark Selected as Attended ({selectedAttendees.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminEvents;
