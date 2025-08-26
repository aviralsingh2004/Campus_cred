import React, { useState } from 'react';
import { 
  HeartIcon, 
  MessageCircleIcon, 
  ShareIcon, 
  BookmarkIcon,
  ClockIcon,
  UserIcon,
  TrendingUpIcon,
  FilterIcon
} from 'lucide-react';
import { cn } from '../utils/helpers';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Sample posts data
  const posts = [
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
        year: "Junior"
      },
      category: "community",
      tags: ["service", "impact", "volunteering"],
      likes: 203,
      comments: 42,
      shares: 25,
      readTime: "8 min read",
      publishedAt: "2024-01-12T16:45:00Z",
      featured: false
    },
    {
      id: 5,
      title: "My Journey from 0 to 1000 Points",
      excerpt: "A detailed breakdown of my two-year journey building up my points balance through consistent effort and smart strategies.",
      content: "When I started college, I had no idea how the points system worked. Fast forward two years, and I've earned over 1000 points. Here's my complete journey, including the mistakes I made, the strategies that worked, and the lessons I learned...",
      author: {
        name: "Alex Thompson",
        avatar: "AT",
        role: "Engineering",
        year: "Senior"
      },
      category: "journey",
      tags: ["journey", "strategy", "motivation"],
      likes: 312,
      comments: 67,
      shares: 34,
      readTime: "10 min read",
      publishedAt: "2024-01-11T11:30:00Z",
      featured: true
    },
    {
      id: 6,
      title: "The Hidden Benefits of the Points System",
      excerpt: "Beyond rewards and recognition, discover how the points system has helped me develop skills that will benefit me throughout my career.",
      content: "While the immediate benefits of points are obvious - rewards, recognition, and opportunities - the long-term benefits are even more valuable. Through my participation in various point-earning activities, I've developed leadership skills...",
      author: {
        name: "Lisa Wang",
        avatar: "LW",
        role: "Marketing",
        year: "Senior"
      },
      category: "benefits",
      tags: ["career", "skills", "development"],
      likes: 178,
      comments: 28,
      shares: 16,
      readTime: "6 min read",
      publishedAt: "2024-01-10T13:20:00Z",
      featured: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Posts', count: posts.length },
    { id: 'academic', name: 'Academic', count: posts.filter(p => p.category === 'academic').length },
    { id: 'events', name: 'Events', count: posts.filter(p => p.category === 'events').length },
    { id: 'community', name: 'Community', count: posts.filter(p => p.category === 'community').length },
    { id: 'journey', name: 'Journey', count: posts.filter(p => p.category === 'journey').length },
    { id: 'benefits', name: 'Benefits', count: posts.filter(p => p.category === 'benefits').length }
  ];

  const filteredPosts = posts.filter(post => 
    selectedCategory === 'all' || post.category === selectedCategory
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    } else if (sortBy === 'popular') {
      return b.likes - a.likes;
    } else if (sortBy === 'trending') {
      return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus Community</h1>
        <p className="text-gray-600">Discover insights, tips, and stories from your peers</p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <FilterIcon className="h-4 w-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      {/* Featured Posts */}
      {selectedCategory === 'all' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUpIcon className="h-5 w-5 mr-2 text-primary-600" />
            Featured Posts
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedPosts.filter(post => post.featured).slice(0, 2).map((post) => (
              <FeaturedPostCard key={post.id} post={post} formatDate={formatDate} />
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div className="space-y-6">
        {sortedPosts.map((post) => (
          <PostCard key={post.id} post={post} formatDate={formatDate} />
        ))}
      </div>

      {sortedPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts found in this category.</p>
        </div>
      )}
    </div>
  );
};

const FeaturedPostCard = ({ post, formatDate }) => (
  <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
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

export default Home;
