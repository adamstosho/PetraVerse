import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { authAPI } from '../lib/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || {},
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile(data);
      updateUser(response.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      await authAPI.changePassword(data);
      setShowChangePassword(false);
      resetPassword();
      toast.success('Password changed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || {},
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
              </div>
              {!isEditing && (
                <Button onClick={handleEdit} leftIcon={<Save className="w-4 h-4" />}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Profile Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      {...register('name')}
                      label="Full Name"
                      placeholder="Enter your full name"
                      error={errors.name?.message}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Input
                      {...register('email')}
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
                      error={errors.email?.message}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Input
                      {...register('phone')}
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      error={errors.phone?.message}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </div>

            {/* Security Settings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Change Password</h3>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowChangePassword(!showChangePassword)}
                  >
                    {showChangePassword ? 'Cancel' : 'Change Password'}
                  </Button>
                </div>

                {showChangePassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                      <div className="relative">
                        <Input
                          {...registerPassword('currentPassword')}
                          label="Current Password"
                          type={showPasswords.current ? 'text' : 'password'}
                          placeholder="Enter current password"
                          error={passwordErrors.currentPassword?.message}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          {...registerPassword('newPassword')}
                          label="New Password"
                          type={showPasswords.new ? 'text' : 'password'}
                          placeholder="Enter new password"
                          error={passwordErrors.newPassword?.message}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          {...registerPassword('confirmPassword')}
                          label="Confirm New Password"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          error={passwordErrors.confirmPassword?.message}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowChangePassword(false);
                            resetPassword();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          isLoading={isLoading}
                          leftIcon={<Shield className="w-4 h-4" />}
                        >
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Account Type</h3>
                      <p className="text-sm text-gray-600 capitalize">{user?.role || 'User'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Email Verification</h3>
                      <p className="text-sm text-gray-600">
                        {user?.isEmailVerified ? 'Email verified' : 'Email not verified'}
                      </p>
                    </div>
                  </div>
                  {!user?.isEmailVerified && (
                    <Button variant="outline" size="sm">
                      Resend Verification
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                      <p className="text-sm text-gray-600">Manage your notification preferences</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
              <div className="border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-900">Delete Account</h3>
                    <p className="text-sm text-red-600">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        // Handle account deletion
                        toast.error('Account deletion not implemented yet');
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 