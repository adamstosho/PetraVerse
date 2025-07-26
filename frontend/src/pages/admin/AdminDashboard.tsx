import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  MessageCircle,
  PlusCircle,
  Settings,
  BarChart3
} from 'lucide-react';
import { adminAPI } from '../../lib/admin';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPets: number;
  approvedPets: number;
  pendingPets: number;
  totalReports: number;
  pendingReports: number;
  highPriorityReports: number;
}

interface RecentActivity {
  users: Array<{ _id: string; name: string; email: string; createdAt: string }>;
  pets: Array<{ _id: string; name: string; type: string; owner: { name: string }; createdAt: string }>;
  reports: Array<{ _id: string; type: string; reporter: { name: string }; createdAt: string }>;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPets: 0,
    approvedPets: 0,
    pendingPets: 0,
    totalReports: 0,
    pendingReports: 0,
    highPriorityReports: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    users: [],
    pets: [],
    reports: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.stats);
      setRecentActivity(response.recent);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      change: '+8%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Total Pets',
      value: stats.totalPets,
      change: '+15%',
      changeType: 'positive' as const,
      icon: Heart,
      color: 'purple'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingPets,
      change: '-5%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'yellow'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Pets',
      description: 'Approve, reject, or edit pet posts',
      icon: Heart,
      action: () => navigate('/admin/pets'),
      color: 'blue'
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: Users,
      action: () => navigate('/admin/users'),
      color: 'green'
    },
    {
      title: 'Reports',
      description: 'Review and handle reports',
      icon: AlertTriangle,
      action: () => navigate('/admin/reports'),
      color: 'red'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and insights',
      icon: BarChart3,
      action: () => navigate('/admin/analytics'),
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
                  <div className="text-center">
                    <div className={`inline-flex p-3 rounded-lg bg-${action.color}-100 mb-4`}>
                      <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentActivity.users.length > 0 ? (
                  recentActivity.users.map((user) => (
                    <div key={user._id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent users</p>
                )}
              </div>
            </Card>

            {/* Recent Pets */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Pets</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/pets')}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentActivity.pets.length > 0 ? (
                  recentActivity.pets.map((pet) => (
                    <div key={pet._id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{pet.name}</p>
                        <p className="text-xs text-gray-500">{pet.type} • {pet.owner.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent pets</p>
                )}
              </div>
            </Card>

            {/* Recent Reports */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/reports')}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentActivity.reports.length > 0 ? (
                  recentActivity.reports.map((report) => (
                    <div key={report._id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{report.type}</p>
                        <p className="text-xs text-gray-500">by {report.reporter.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent reports</p>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;