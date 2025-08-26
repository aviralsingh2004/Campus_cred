import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  CreditCardIcon,
  UsersIcon,
  GiftIcon,
  BarChart3Icon,
  LogOutIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  BellIcon,
  SearchIcon,
  StarIcon,
  TrendingUpIcon,
  AwardIcon,
  GraduationCapIcon
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: isAdmin ? '/admin' : '/dashboard',
      icon: HomeIcon,
      current: location.pathname === (isAdmin ? '/admin' : '/dashboard')
    },
    ...(isAdmin
      ? [
          {
            name: 'Students',
            href: '/admin/students',
            icon: UsersIcon,
            current: location.pathname.startsWith('/admin/students')
          },
          {
            name: 'Analytics',
            href: '/admin/analytics',
            icon: TrendingUpIcon,
            current: location.pathname === '/admin/analytics'
          },
          {
            name: 'Rewards',
            href: '/admin/rewards',
            icon: GiftIcon,
            current: location.pathname === '/admin/rewards'
          }
        ]
      : [
          {
            name: 'My Points',
            href: '/points',
            icon: StarIcon,
            current: location.pathname === '/points'
          },
          {
            name: 'Rewards Store',
            href: '/rewards',
            icon: GiftIcon,
            current: location.pathname === '/rewards'
          },
          {
            name: 'Achievements',
            href: '/achievements',
            icon: AwardIcon,
            current: location.pathname === '/achievements'
          }
        ]
    )
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center">
          <GraduationCapIcon className="h-8 w-8 text-white mr-3" />
          <span className="text-xl font-bold text-white">Campus Cred</span>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-lg">
            {user ? getInitials(user.first_name, user.last_name) : 'U'}
          </div>
          <div className="ml-4">
            <p className="text-sm font-semibold text-gray-900">
              {user ? `${user.first_name} ${user.last_name}` : 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Administrator' : 'Student'}
            </p>
            {user?.student_id && (
              <p className="text-xs text-gray-400">ID: {user.student_id}</p>
            )}
          </div>
        </div>
        {user?.points_balance !== undefined && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Points</span>
              <span className="text-lg font-bold text-yellow-600">{user.points_balance || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                item.current
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <LogOutIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-lg">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-lg mx-4 lg:mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {user ? getInitials(user.first_name, user.last_name) : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
