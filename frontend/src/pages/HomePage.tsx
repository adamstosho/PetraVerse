import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  PlusCircle, 
  Users, 
  Heart,
  ArrowRight,
  MapPin,
  Clock,
  Shield,
  Star,
  CheckCircle,
  MessageCircle
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find pets with advanced filters and location-based search',
      color: 'from-primary-400 to-primary-500',
    },
    {
      icon: MapPin,
      title: 'Location Tracking',
      description: 'Track last seen locations with interactive maps',
      color: 'from-accent-400 to-accent-500',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Get notified instantly when someone contacts you',
      color: 'from-success-400 to-success-500',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Your information is protected with industry-standard security',
      color: 'from-warning-400 to-warning-500',
    },
  ];

  const stats = [
    { number: '15,000+', label: 'Pets Reunited', icon: Heart },
    { number: '50,000+', label: 'Active Users', icon: Users },
    { number: '200+', label: 'Cities Covered', icon: MapPin },
    { number: '24/7', label: 'Support Available', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full opacity-20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-accent-400 to-success-400 rounded-full opacity-20 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full text-primary-700 font-medium text-sm mb-6"
              >
                <Star className="w-4 h-4 mr-2" />
                Trusted by 50,000+ pet lovers
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
                Bringing Lost Pets
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"> Home</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Connect with your community to help lost pets find their families. 
                Post, search, and reunite with the power of community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="shadow-glow" asChild>
                  <Link to="/search">
                    <Search className="w-5 h-5 mr-2" />
                    Search for Pets
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to={isAuthenticated ? "/pets/create" : "/register"}>
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Post a Pet
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"
                  alt="Happy pet reunion"
                  className="w-full h-96 object-cover rounded-3xl shadow-large"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
              </div>
              <motion.div 
                className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl shadow-large"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-error-400 to-error-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 text-lg">15,000+</p>
                    <p className="text-sm text-neutral-600">Pets Reunited</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft group-hover:shadow-medium transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </p>
                <p className="text-neutral-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              How PetConnect Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Our platform makes it easy to post missing pets, search for found animals, 
              and connect with your community to bring pets home safely.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="text-center h-full p-6 hover:shadow-medium transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              Simple Steps to Reunite
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Follow these three simple steps to help bring pets back to their loving families
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Post or Search',
                description: 'Create a post for your missing pet or search our database of found animals',
                image: 'https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg',
                color: 'from-primary-400 to-primary-500'
              },
              {
                step: '2',
                title: 'Connect Safely',
                description: 'Use our secure messaging system to connect with potential matches',
                image: 'https://images.pexels.com/photos/4148009/pexels-photo-4148009.jpeg',
                color: 'from-accent-400 to-accent-500'
              },
              {
                step: '3',
                title: 'Happy Reunion',
                description: 'Arrange a safe meetup and celebrate the joyful reunion with your pet',
                image: 'https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg',
                color: 'from-success-400 to-success-500'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center group"
                whileHover={{ y: -5 }}
              >
                <div className="relative mb-6">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-64 object-cover rounded-2xl shadow-soft group-hover:shadow-medium transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                  <div className={`absolute -top-4 left-4 w-12 h-12 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-soft`}>
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-accent-600 to-success-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Help a Pet Find Home?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of pet lovers making a difference in their communities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="shadow-glow" asChild>
                <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                  Get Started Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600 shadow-soft" asChild>
                <Link to="/search">
                  Browse Lost Pets
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;