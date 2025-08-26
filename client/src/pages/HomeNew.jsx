import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  MessageCircleIcon, 
  ShareIcon, 
  BookmarkIcon,
  ClockIcon,
  UserIcon,
  TrendingUpIcon,
  FilterIcon,
  PlusIcon,
  XIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon
} from 'lucide-react';
import { cn } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import EventRegistrationModal from '../components/ui/EventRegistrationModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Home = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'events'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Posts state
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'academic',
    tags: ''
  });
  
  // Events state
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    } else {
      fetchEvents();
    }
  }, [activeTab, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('campus_cred_token');
      const response = await fetch(`/api/posts?category=${selectedCategory}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events?category=${selectedCategory}`);

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

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('campus_cred_token');
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the post in the state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  likes_count: data.data.likes_count, 
                  user_has_liked: data.data.user_has_liked 
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    try {
      setCreating(true);
      const token = localStorage.getItem('campus_cred_token');
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPost)
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => [data.data, ...prev]);
        setNewPost({ title: '', content: '', category: 'academic', tags: '' });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const categories = [
    { id: 'all', name: 'All', count: activeTab === 'posts' ? posts.length : events.length },
    { id: 'academic', name: 'Academic', count: activeTab === 'posts' ? posts.filter(p => p.category === 'academic').length : events.filter(e => e.category === 'academic').length },
    { id: 'community', name: 'Community', count: activeTab === 'posts' ? posts.filter(p => p.category === 'community').length : events.filter(e => e.category === 'community').length },
    { id: 'events', name: 'Events', count: activeTab === 'posts' ? posts.filter(p => p.category === 'events').length : events.filter(e => e.category === 'events').length },
    { id: 'tech', name: 'Technology', count: activeTab === 'posts' ? posts.filter(p => p.category === 'tech').length : events.filter(e => e.category === 'tech').length },
  ];

  const filteredItems = activeTab === 'posts' 
    ? posts.filter(post => selectedCategory === 'all' || post.category === selectedCategory)
    : events.filter(event => selectedCategory === 'all' || event.category === selectedCategory);

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (activeTab === 'posts' && sortBy === 'popular') {
      return (b.likes_count || 0) - (a.likes_count || 0);
    }
    if (activeTab === 'events' && sortBy === 'upcoming') {
      return new Date(a.event_date) - new Date(b.event_date);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Feed</h1>
          <p className="text-gray-600 mt-1">Discover posts and events from your campus community</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'posts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'events'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Events
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="latest">Latest</option>
          {activeTab === 'posts' && <option value="popular">Most Popular</option>}
          {activeTab === 'events' && <option value="upcoming">Upcoming</option>}
        </select>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'posts' ? (
          // Posts
          sortedItems.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} formatDate={formatDate} />
          ))
        ) : (
          // Events
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onClick={handleEventClick}
                formatDate={formatDate} 
              />
            ))}
          </div>
        )}
      </div>

      {sortedItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No {activeTab} found in this category.
          </p>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          newPost={newPost}
          setNewPost={setNewPost}
          creating={creating}
          onSave={handleCreatePost}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Event Registration Modal */}
      {showEventModal && selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

// Post Card Component
const PostCard = ({ post, onLike, formatDate }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">
              {post.first_name?.charAt(0)}{post.last_name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {post.first_name} {post.last_name}
            </p>
            <p className="text-sm text-gray-500">
              {post.author_role} • {formatDate(post.created_at)}
            </p>
          </div>
        </div>
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          'bg-gray-100 text-gray-600'
        )}>
          {post.category}
        </span>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
        <p className="text-gray-600">{post.excerpt}</p>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onLike(post.id)}
            className={cn(
              'flex items-center space-x-1 text-sm transition-colors',
              post.user_has_liked
                ? 'text-red-600 hover:text-red-700'
                : 'text-gray-500 hover:text-red-600'
            )}
          >
            <HeartIcon className={cn(
              'h-5 w-5',
              post.user_has_liked ? 'fill-current' : ''
            )} />
            <span>{post.likes_count || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
            <MessageCircleIcon className="h-5 w-5" />
            <span>{post.comments_count || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
            <ShareIcon className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          {post.read_time}
        </div>
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onClick, formatDate }) => {
  const isUpcoming = new Date(event.event_date) > new Date();
  const availableSpots = event.available_spots;
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(event)}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          )}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </span>
          <span className="text-primary-600 font-semibold">
            +{event.points_reward} pts
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm">{event.description}</p>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {new Date(event.event_date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 mr-2" />
          {event.location}
        </div>
        <div className="flex items-center">
          <UsersIcon className="h-4 w-4 mr-2" />
          {event.registration_count} registered
          {event.max_participants && (
            <span className="ml-1">
              • {availableSpots > 0 ? `${availableSpots} spots left` : 'Full'}
            </span>
          )}
        </div>
      </div>

      <button 
        className={cn(
          'w-full py-2 px-4 rounded-lg font-medium transition-colors',
          isUpcoming && availableSpots !== 0
            ? 'bg-primary-600 hover:bg-primary-700 text-white'
            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
        )}
        disabled={!isUpcoming || availableSpots === 0}
      >
        {!isUpcoming ? 'Event Ended' : 
         availableSpots === 0 ? 'Event Full' : 
         'Register Now'}
      </button>
    </div>
  );
};

// Create Post Modal Component
const CreatePostModal = ({ newPost, setNewPost, creating, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => !creating && onClose()} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create a new post</h3>
          <button
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => !creating && onClose()}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="What's on your mind?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost(p => ({ ...p, content: e.target.value }))}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Share your thoughts, experiences, or tips..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="academic">Academic</option>
                <option value="community">Community</option>
                <option value="tech">Technology</option>
                <option value="career">Career</option>
                <option value="social">Social</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={newPost.tags}
                onChange={(e) => setNewPost(p => ({ ...p, tags: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="study, tips, programming"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={creating || !newPost.title.trim() || !newPost.content.trim()}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {creating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{creating ? 'Creating...' : 'Create Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
