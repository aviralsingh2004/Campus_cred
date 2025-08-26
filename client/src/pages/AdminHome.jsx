import React, { useState } from 'react';
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
  XIcon
} from 'lucide-react';
import { cn } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const AdminHome = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'academic',
    tags: ''
  });

  // Sample posts data (same as student home)
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "How I Earned 500 Points in My First Semester",
      excerpt: "A comprehensive guide to maximizing your campus points through academic excellence, community service, and strategic participation in campus events.",
      content: "Starting college can be overwhelming, but understanding the points system early on gave me a huge advantage. I focused on three key areas: maintaining a 3.8+ GPA, volunteering at least 10 hours per month, and actively participating in student organizations. The key was consistency and finding activities that aligned with my interests...",
      author: {
        name: "Sarah Johnson",
        avatar: "SJ",
        role: "Computer Science",
        year: "Sophomore"
      },
      category: "academic",
      tags: ["points", "tips", "first-year"],
      likes: 127,
      comments: 23,
      shares: 8,
      readTime: "5 min read",
      publishedAt: "2024-01-15T10:30:00Z",
      featured: true
    },
    {
      id: 2,
      title: "The Ultimate Guide to Campus Events That Give Points",
      excerpt: "Discover which campus events offer the most points and how to make the most of your time while having fun and building connections.",
      content: "After attending over 50 campus events in my first year, I've compiled a comprehensive list of the most rewarding activities. Academic workshops typically offer 10-20 points, while community service events can give you 15-30 points. The real gems are the leadership development programs...",
      author: {
        name: "Michael Chen",
        avatar: "MC",
        role: "Business Administration",
        year: "Junior"
      },
      category: "events",
      tags: ["events", "leadership", "networking"],
      likes: 89,
      comments: 15,
      shares: 12,
      readTime: "7 min read",
      publishedAt: "2024-01-14T14:20:00Z",
      featured: false
    },
    {
      id: 3,
      title: "Balancing Academics and Points: My Experience",
      excerpt: "How I maintained a 4.0 GPA while earning 300+ points through strategic time management and smart choices.",
      content: "Many students think they have to choose between academic excellence and earning points, but that's not true. I developed a system that allowed me to excel in both areas. The secret was integrating point-earning activities into my study routine...",
      author: {
        name: "Emily Rodriguez",
        avatar: "ER",
        role: "Psychology",
        year: "Senior"
      },
      category: "academic",
      tags: ["balance", "study-tips", "time-management"],
      likes: 156,
      comments: 31,
      shares: 19,
      readTime: "6 min read",
      publishedAt: "2024-01-13T09:15:00Z",
      featured: true
    },
    {
      id: 4,
      title: "Community Service Projects That Actually Make a Difference",
      excerpt: "Beyond the points, here are the most impactful community service opportunities that will change your perspective on giving back.",
      content: "While earning points is great, the real reward comes from making a genuine impact in your community. I've participated in various service projects, from tutoring underprivileged students to organizing food drives. The most rewarding experiences were...",
      author: {
        name: "David Kim",
        avatar: "DK",
        role: "Social Work",
        year: "Freshman"
      },
      category: "community",
      tags: ["community", "service", "impact"],
      likes: 98,
      comments: 18,
      shares: 14,
      readTime: "4 min read",
      publishedAt: "2024-01-12T16:45:00Z",
      featured: false
    },
    {
      id: 5,
      title: "Tech Skills That Boost Your Points and Career",
      excerpt: "Learn about the technical workshops and certifications that not only give you points but also enhance your resume.",
      content: "In today's digital world, having strong technical skills is crucial. I discovered that many of the tech workshops offered on campus not only award generous points but also provide valuable certifications that employers value...",
      author: {
        name: "Alex Thompson",
        avatar: "AT",
        role: "Computer Engineering",
        year: "Junior"
      },
      category: "tech",
      tags: ["technology", "career", "skills"],
      likes: 134,
      comments: 27,
      shares: 21,
      readTime: "8 min read",
      publishedAt: "2024-01-11T11:20:00Z",
      featured: true
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Posts', count: posts.length },
    { id: 'academic', name: 'Academic', count: posts.filter(p => p.category === 'academic').length },
    { id: 'events', name: 'Events', count: posts.filter(p => p.category === 'events').length },
    { id: 'community', name: 'Community', count: posts.filter(p => p.category === 'community').length },
    { id: 'tech', name: 'Tech', count: posts.filter(p => p.category === 'tech').length }
  ];

  const sortOptions = [
    { id: 'latest', name: 'Latest' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'trending', name: 'Trending' }
  ];

  const filteredPosts = posts
    .filter(post => selectedCategory === 'all' || post.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes;
        case 'trending':
          return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
        default: // latest
          return new Date(b.publishedAt) - new Date(a.publishedAt);
      }
    });

  const featuredPosts = posts.filter(post => post.featured).slice(0, 3);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setCreating(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const post = {
      id: posts.length + 1,
      ...newPost,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      author: {
        name: `${user.first_name} ${user.last_name}`,
        avatar: `${user.first_name[0]}${user.last_name[0]}`,
        role: "Admin",
        year: "Staff"
      },
      likes: 0,
      comments: 0,
      shares: 0,
      readTime: `${Math.ceil(newPost.content.split(' ').length / 200)} min read`,
      publishedAt: new Date().toISOString(),
      featured: false
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ title: '', content: '', category: 'academic', tags: '' });
    setShowCreateModal(false);
    setCreating(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campus Community</h1>
            <p className="text-gray-600 mt-1">Discover stories, tips, and insights from the campus community</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Create Post
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <HeartIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{posts.reduce((acc, post) => acc + post.likes, 0)}</p>
                <p className="text-sm text-gray-600">Total Likes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                <MessageCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{posts.reduce((acc, post) => acc + post.comments, 0)}</p>
                <p className="text-sm text-gray-600">Total Comments</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                <TrendingUpIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <FeaturedPostCard key={post.id} post={post} formatDate={formatDate} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    selectedCategory === category.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Controls */}
          <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-500">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} formatDate={formatDate} />
            ))}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter post title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="academic">Academic</option>
                  <option value="events">Events</option>
                  <option value="community">Community</option>
                  <option value="tech">Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                  placeholder="Write your post content..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="tips, academic, first-year"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  disabled={creating}
                >
                  {creating ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FeaturedPostCard = ({ post, formatDate }) => (
  <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
          Featured
        </span>
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
          {post.category}
        </span>
        <span className="text-gray-500 text-sm">•</span>
        <span className="text-gray-500 text-sm">{formatDate(post.publishedAt)}</span>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
        {post.title}
      </h3>
      
      <p className="text-gray-600 mb-4 line-clamp-3">
        {post.excerpt}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 text-primary-700 h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium">
            {post.author.avatar}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
            <p className="text-xs text-gray-500">{post.author.role} • {post.author.year}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            {post.readTime}
          </div>
        </div>
      </div>
    </div>
  </article>
);

const PostCard = ({ post, formatDate }) => (
  <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-4">
      {/* Author Avatar */}
      <div className="bg-primary-100 text-primary-700 h-12 w-12 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
        {post.author.avatar}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
            {post.category}
          </span>
          <span className="text-gray-500 text-sm">•</span>
          <span className="text-gray-500 text-sm">{formatDate(post.publishedAt)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors cursor-pointer">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {post.readTime}
            </div>
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {post.author.name}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
              <HeartIcon className="h-4 w-4" />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircleIcon className="h-4 w-4" />
              <span className="text-sm">{post.comments}</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
              <ShareIcon className="h-4 w-4" />
              <span className="text-sm">{post.shares}</span>
            </button>
            <button className="text-gray-500 hover:text-yellow-500 transition-colors">
              <BookmarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
);

export default AdminHome;
