import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Main Pages
import DashboardPage from '../pages/DashboardPage';
import SearchPage from '../pages/SearchPage';
import ProfilePage from '../pages/ProfilePage';
import NotificationsPage from '../pages/NotificationsPage';

// Pet Pages
import CreatePetPage from '../pages/pets/CreatePetPage';
import PetDetailPage from '../pages/pets/PetDetailPage';
import MyPetsPage from '../pages/pets/MyPetsPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminPetsPage from '../pages/admin/AdminPetsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import LandingPage from '../pages/LandingPage';

const AppRouter: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPasswordPage /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password/:token" element={!user ? <ResetPasswordPage /> : <Navigate to="/dashboard" />} />

        {/* Landing Page */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="pets/create" element={<CreatePetPage />} />
          <Route path="pets/my-pets" element={<MyPetsPage />} />
          <Route path="pets/:id" element={<PetDetailPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pets" element={<AdminPetsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;