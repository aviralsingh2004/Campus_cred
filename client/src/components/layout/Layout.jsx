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
  XIcon
} from 'lucide-react';
import { cn, getInitials, generateAvatarColor } from '../../utils/helpers';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Home',
      href: isAdmin ? '/admin' : '/Home',
      icon: HomeIcon,
      current: location.pathname === (isAdmin ? '/admin' : '/Home')
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
            name: 'Transactions',
            href: '/admin/transactions',
            icon: BarChart3Icon,
            current: location.pathname === '/admin/transactions'
          },
          {
            name: 'Rewards',
            href: '/admin/rewards',
            icon: GiftIcon,
            current: location.pathname.startsWith('/admin/rewards')
          }
        ]
      : [
          {
            name: 'My Points',
            href: '/points',
            icon: CreditCardIcon,
            current: location.pathname === '/points'
          },
          {
            name: 'Rewards',
            href: '/rewards',
            icon: GiftIcon,
            current: location.pathname.startsWith('/rewards')
          }
        ])
  ];

  const avatarColor = generateAvatarColor(`${user?.first_name} ${user?.last_name}`);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
          <SidebarContent
            navigation={navigation}
            user={user}
            avatarColor={avatarColor}
            onLogout={handleLogout}
            onCloseSidebar={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-white lg:shadow-lg lg:flex lg:flex-col">
        <SidebarContent
          navigation={navigation}
          user={user}
          avatarColor={avatarColor}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 ml-2">
                CampusCred
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                  {user?.student_id && ` • ${user.student_id}`}
                </p>
              </div>
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                  avatarColor
                )}
              >
                {getInitials(user?.first_name, user?.last_name)}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, user, avatarColor, onLogout, onCloseSidebar }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-primary-600 p-2 rounded-lg">
            <CreditCardIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">CampusCred</h1>
            <p className="text-xs text-gray-500">Points System</p>
          </div>
        </div>
        {onCloseSidebar && (
          <button
            className="ml-auto lg:hidden p-1 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={onCloseSidebar}
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onCloseSidebar}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                item.current
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
              avatarColor
            )}
          >
            {getInitials(user?.first_name, user?.last_name)}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <LogOutIcon className="h-5 w-5 mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Layout;
