import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Search, 
  Eye, 
  MessageCircle, 
  Clock,
  MapPin,
  Heart
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { petsAPI } from '../lib/pets';
import { notificationsAPI } from '../lib/notifications';
import { Pet, Notification } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    postsCreated: 0,
    totalViews: 0,
    messages: 0,
    activePosts: 0,
  });
  const [recentPets, setRecentPets] = useState<Pet[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's pets
        const petsResponse = await petsAPI.getMyPets({ limit: 5 });
        setRecentPets(petsResponse.pets);
        
        // Calculate stats from pets data
        const totalViews = petsResponse.pets.reduce((sum, pet) => sum + pet.views, 0);
        const activePosts = petsResponse.pets.filter(pet => pet.status !== 'reunited').length;
        
        setStats({
          postsCreated: petsResponse.pagination.total,
          totalViews,
          messages: 0, // TODO: Implement when backend has messages endpoint
          activePosts,
        });

        // Fetch recent notifications
        const notificationsResponse = await notificationsAPI.getNotifications({ limit: 5 });
        setNotifications(notificationsResponse.notifications);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    { label: 'Posts Created', value: stats.postsCreated, icon: PlusCircle, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Messages', value: stats.messages, icon: MessageCircle, color: 'bg-amber-100 text-amber-600' },
    { label: 'Active Posts', value: stats.activePosts, icon: Clock, color: 'bg-purple-100 text-purple-600' },
  ];

  const quickActions = [
    {
      title: 'Post a Missing Pet',
      description: 'Create a new post for a lost pet',
      icon: PlusCircle,
      href: '/pets/create',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Search for Pets',
      description: 'Browse found pets in your area',
      icon: Search,
      href: '/search',
      color: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      title: 'View My Posts',
      description: 'Manage your pet listings',
      icon: Eye,
      href: '/pets/my-pets',
      color: 'bg-amber-600 hover:bg-amber-700'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your pet posts and community activity.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
            <Card key={stat.label} className="text-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.href}
                    className={`block p-4 rounded-lg text-white ${action.color} transition-colors`}
                  >
                    <div className="flex items-center">
                      <action.icon className="w-5 h-5 mr-3" />
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Pets */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Pet Posts</h2>
                <Link
                  to="/pets/my-pets"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              
              {recentPets.length > 0 ? (
                <div className="space-y-4">
                  {recentPets.map((pet) => (
                    <div key={pet._id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                        {pet.photos && pet.photos.length > 0 ? (
                          <img
                            src={pet.photos[0]}
                            alt={pet.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <Heart className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {pet.type} • {pet.status}
                        </p>
                        <div className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            {pet.lastSeenLocation?.city || 'Unknown location'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{pet.views} views</p>
                        <p className="text-xs text-gray-500">
                          {new Date(pet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't posted any pets yet.</p>
                  <Link to="/pets/create">
                    <Button>Create Your First Post</Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Notifications</h2>
                <Link
                  to="/notifications"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification._id} className="flex items-start p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;