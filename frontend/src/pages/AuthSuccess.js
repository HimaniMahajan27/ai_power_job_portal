import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      toast.success('Welcome back!');
      // Reload to let AuthProvider pick up the new token
      window.location.href = '/dashboard';
    } else {
      toast.error('Authentication failed');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
    </div>
  );
};

export default AuthSuccess;
