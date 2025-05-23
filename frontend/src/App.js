import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Signup from './components/Signup';
import ConfirmSignup from './components/ConfirmSignup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import TaskPage from './components/TaskPage';
import CreateTask from './components/CreateTask';
import EditTask from './components/EditTask';
import TaskDashboard from './components/TaskDashboard';
import { Button, AppBar, Toolbar, Typography } from '@mui/material';
import config from './config';

axios.defaults.withCredentials = true;

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/auth/session`);
        if (response.data.message === 'Session active') {
          setUser({ ...response.data, id: 1, authenticated: true });
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null);
          const currentPath = window.location.pathname;
          const authPaths = ['/login', '/signup', '/confirm', '/forgot-password', '/reset-password'];
          if (!authPaths.includes(currentPath)) {
            navigate('/login');
          }
        } else {
          console.error('Error checking session:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = (userData) => {
    setUser({ ...userData, id: 1, authenticated: true });
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
          {user?.authenticated && (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/dashboard')}
                sx={{ mr: 2 }}
              >
                Dashboard
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/confirm" element={<ConfirmSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/tasks" element={<TaskPage onLogout={handleLogout} user={user} />} />
        <Route path="/edit-task/:taskId" element={<EditTask user={user} />} />
        <Route path="/dashboard" element={<TaskDashboard user={user} />} />
        <Route path="*" element={<Navigate to="/tasks" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;