import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PetraVerseLogo from '../components/layout/PetraVerseLogo';
import Button from '../components/ui/Button';

const features = [
  {
    title: 'Find & Reunite',
    description: 'Search for lost and found pets in your area and help reunite families.',
    icon: '🐾',
  },
  {
    title: 'Post Instantly',
    description: 'Create a post for your lost or found pet in seconds with photos and details.',
    icon: '📸',
  },
  {
    title: 'Community Support',
    description: 'Join a caring community dedicated to helping pets and their owners.',
    icon: '🤝',
  },
  {
    title: 'Real-Time Updates',
    description: 'Get instant notifications and updates about your posts and messages.',
    icon: '🔔',
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 pointer-events-none"
        poster="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-dog-wearing-a-hat-and-scarf-in-autumn-2936-large.mp4" type="video/mp4" />
        {/* Fallback image if video fails */}
      </video>
      {/* Overlay for gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/80 z-0" />

      {/* Hero Section */}
      <header className="relative z-10 flex flex-col items-center justify-center flex-1 pt-24 pb-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <PetraVerseLogo size={88} className="drop-shadow-2xl mb-4" />
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary-400 via-accent-400 to-pink-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            Welcome to PetraVerse
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-neutral-200 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            The most beautiful, modern, and caring platform for lost & found pets. Join a community that cares.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7, type: 'spring' }}
          >
            <Button
              size="lg"
              className="shadow-glow px-10 py-4 text-lg font-bold bg-gradient-to-r from-primary-500 to-accent-500 hover:from-accent-500 hover:to-primary-500 transition-all duration-300"
              onClick={() => navigate('/search')}
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </header>

      {/* Features Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            className="bg-white/10 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg backdrop-blur-md border border-white/10 hover:scale-105 hover:shadow-2xl transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.15, duration: 0.7 }}
            viewport={{ once: true }}
          >
            <span className="text-4xl mb-4 animate-bounce-slow">{feature.icon}</span>
            <h3 className="text-2xl font-bold text-white mb-2 gradient-text">
              {feature.title}
            </h3>
            <p className="text-neutral-200 text-lg">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Community/CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/10 rounded-2xl p-8 shadow-lg backdrop-blur-md border border-white/10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 gradient-text">
            Join the PetraVerse Community
          </h2>
          <p className="text-neutral-200 text-lg mb-6">
            Connect, share, and help pets find their way home. Your kindness makes a difference.
          </p>
          <Button
            size="lg"
            className="shadow-glow px-10 py-4 text-lg font-bold bg-gradient-to-r from-primary-500 to-accent-500 hover:from-accent-500 hover:to-primary-500 transition-all duration-300"
            onClick={() => navigate('/register')}
          >
            Join Now
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <PetraVerseLogo size={32} />
            <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              PetraVerse
            </span>
          </div>
          <p className="text-neutral-300 text-sm">© {new Date().getFullYear()} PetraVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 