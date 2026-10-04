import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RoleRoute = ({ allowedRoles }) => {
  const { role, loading } = useAuth();

  if (loading) return null;
  if (!allowedRoles.includes(role)) return <Navigate to="/overview" replace />;

  return <Outlet />;
};

export default RoleRoute;