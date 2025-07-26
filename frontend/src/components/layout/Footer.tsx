import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import PetraVerseLogo from './PetraVerseLogo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full opacity-10 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
                <PetraVerseLogo size={44} />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  PetraVerse
                </span>
              </Link>
              <p className="text-neutral-300 mb-6 max-w-md leading-relaxed">
                Helping lost pets find their way home. 
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-neutral-300">
                  <Mail className="w-4 h-4 text-primary-400" />
                  <span>omoridoh111@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-neutral-300">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <span>+234 (903) 329-5837</span>
                </div>
                <div className="flex items-center space-x-3 text-neutral-300">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>Pegamut, Otta, Ogun State, Nigeria</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {[
                  { icon: Facebook, href: "https://web.facebook.com/profile.php?id=100075090454452", label: "Facebook" },
                  { icon: Twitter, href: "https://x.com/artredox01", label: "Twitter" },
                  { icon: Instagram, href: "https://www.instagram.com/", label: "Instagram" },
                  { icon: Youtube, href: "https://www.youtube.com", label: "YouTube" }
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white hover:shadow-glow transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold text-white mb-6">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { to: "/search", label: "Search Pets" },
                { to: "/dashboard", label: "Dashboard" },
                { to: "/profile", label: "Profile" },
              
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link 
                    to={link.to} 
                    className="text-neutral-300 hover:text-primary-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold text-white mb-6">
              Support
            </h3>
            <ul className="space-y-4">
              {[
                { href: "#", label: "Help Center" },
                { href: "#", label: "Contact Us" },
                
                
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <a 
                    href={link.href} 
                    className="text-neutral-300 hover:text-primary-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="mt-12 pt-8 border-t border-neutral-700"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              © {currentYear} PetraVerse. All rights reserved.
            </p>
            <p className="text-neutral-400 text-sm mt-2 md:mt-0 flex items-center">
              Made with 
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mx-1 text-primary-400"
              >
                ❤️
              </motion.span>
              for pets and their families
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;