import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Heart, User, Mail, Lock, Phone, Sparkles, Shield, Users } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { authAPI } from '../../lib/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot be more than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  phone: z.string()
    .min(10, 'Please enter a valid phone number')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number (e.g., +1234567890 or 1234567890)'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      console.log('Sending registration data:', registerData);
      const response = await authAPI.register(registerData);
      setAuth(response.user, response.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response data:', error.response?.data);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map((err: any) => 
          `${err.field}: ${err.message}`
        ).join(', ');
        toast.error(errorMessages);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed. Please check your information and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 relative overflow-hidden">
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

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/" className="inline-flex items-center justify-center space-x-3 mb-8 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <Heart className="w-10 h-10 text-primary-500 drop-shadow-sm" />
                <motion.div
                  className="absolute inset-0 w-10 h-10 bg-primary-500 rounded-full opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                PetraVerse
              </span>
            </Link>
            
            <motion.h2 
              className="text-4xl font-bold text-neutral-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Join Our Community
            </motion.h2>
            
            <motion.p 
              className="text-lg text-neutral-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Help pets find their way home and connect with fellow animal lovers
            </motion.p>

            {/* Features */}
            <motion.div 
              className="grid grid-cols-3 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-soft">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-neutral-600">Easy to Use</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-soft">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-neutral-600">Secure</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-success-400 to-success-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-soft">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-neutral-600">Community</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-glass p-8 space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-4">
              <Input
                {...register('name')}
                type="text"
                placeholder="Full name (letters and spaces only)"
                leftIcon={<User className="w-5 h-5" />}
                error={errors.name?.message}
                size="lg"
              />

              <Input
                {...register('email')}
                type="email"
                placeholder="Email address"
                leftIcon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                size="lg"
              />

              <Input
                {...register('phone')}
                type="tel"
                placeholder="Phone number (e.g., +1234567890)"
                leftIcon={<Phone className="w-5 h-5" />}
                error={errors.phone?.message}
                size="lg"
              />
              
              <Input
                {...register('password')}
                type="password"
                placeholder="Password"
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                size="lg"
              />

              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="Confirm password"
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.confirmPassword?.message}
                size="lg"
              />
            </div>

            <div className="flex items-start space-x-3">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label htmlFor="agree-terms" className="text-sm text-neutral-700">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="shadow-glow"
            >
              Create Account
            </Button>

            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;