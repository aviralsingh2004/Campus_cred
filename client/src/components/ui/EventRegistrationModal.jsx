import React from 'react';
import { X, Calendar, Users, Trophy } from 'lucide-react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

const EventRegistrationModal = ({ 
  isOpen, 
  onClose, 
  event, 
  onConfirm, 
  loading = false 
}) => {
  if (!isOpen || !event) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Registration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Event Title */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {event.excerpt || event.description}
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-3 mb-6">
            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium capitalize">
                {event.category}
              </span>
            </div>

            {/* Date */}
            {event.event_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.event_date)}</span>
              </div>
            )}

            {/* Participants */}
            {event.max_participants && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {event.registration_count || 0} / {event.max_participants} participants
                </span>
                {event.available_spots !== null && event.available_spots <= 5 && (
                  <span className="text-orange-600 font-medium">
                    (Only {event.available_spots} spots left!)
                  </span>
                )}
              </div>
            )}

            {/* Points Reward */}
            {event.points_reward > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">
                  Earn {event.points_reward} points upon completion
                </span>
              </div>
            )}

            {/* Registration Deadline */}
            {event.registration_deadline && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Registration closes: {formatDate(event.registration_deadline)}
                </span>
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
            <div className="bg-primary-100 text-primary-700 h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium">
              {event.author_avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{event.author_name}</p>
              <p className="text-xs text-gray-500">{event.author_role} • {event.author_year}</p>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              Are you sure you want to register for this activity? You will receive a confirmation 
              and further details via email.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Registering...</span>
                </div>
              ) : (
                'Yes, Register Me'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationModal;
