import React from 'react';
import { motion } from 'framer-motion';

const PetraVerseLogo: React.FC<{ size?: number | string; className?: string }> = ({ size = 44, className = '' }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    initial={{ rotate: 0 }}
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
  >
    <defs>
      <radialGradient id="pv-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
      </radialGradient>
      <linearGradient id="pv-main" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#f472b6" />
      </linearGradient>
    </defs>
    {/* Glow */}
    <circle cx="22" cy="22" r="20" fill="url(#pv-glow)" />
    {/* Stylized P */}
    <motion.path
      d="M13 33V11a7 7 0 017-7h4a7 7 0 010 14h-4v15"
      stroke="url(#pv-main)"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.2 }}
    />
    {/* Paw print (to the right of the P) */}
    <motion.circle cx="32" cy="15" r="3.2" fill="url(#pv-main)" initial={{ scale: 0.7 }} animate={{ scale: [0.7, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }} />
    <circle cx="28.5" cy="11.5" r="1.1" fill="#f472b6" />
    <circle cx="35.5" cy="11.5" r="1.1" fill="#f472b6" />
    <circle cx="29.5" cy="18.5" r="1.1" fill="#f472b6" />
    <circle cx="34.5" cy="18.5" r="1.1" fill="#f472b6" />
    {/* Orbit ring */}
    <motion.ellipse
      cx="22"
      cy="22"
      rx="18"
      ry="7.5"
      stroke="url(#pv-main)"
      strokeWidth="1.2"
      fill="none"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
      style={{ originX: '50%', originY: '50%' }}
    />
  </motion.svg>
);

export default PetraVerseLogo; 