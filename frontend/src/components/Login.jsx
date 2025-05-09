import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Snackbar, Alert, Typography, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationLayout from './AuthenticationLayout';
import config from '../config';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const navigate = useNavigate();

  // Handle countdown timer for lockout
  useEffect(() => {
    let timer;
    if (isLocked && lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTimer]);

  // Format remaining lockout time
  const formatLockoutTime = () => {
    const minutes = Math.floor(lockoutTimer / 60);
    const seconds = lockoutTimer % 60;
    return `${minutes}m ${seconds}s`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setSnackbarMsg(`Account is temporarily locked. Try again in ${formatLockoutTime()}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      onLogin(response.data);
      setSnackbarMsg(response.data.message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Reset login attempts on successful login
      setRemainingAttempts(3);
      
      setTimeout(() => {
        navigate('/tasks');
      }, 1500);
    } catch (error) {
      console.error('Login Error', error);
      
      // Handle rate limiting (429) errors
      if (error.response?.status === 429) {
        setIsLocked(true);
        
        // Extract lockout time from error message if available
        const message = error.response.data.detail || '';
        const timeMatch = message.match(/Try again in (\d+)m (\d+)s/);
        
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1], 10);
          const seconds = parseInt(timeMatch[2], 10);
          setLockoutTimer(minutes * 60 + seconds);
        } else {
          // Default 5 minutes (300 seconds)
          setLockoutTimer(300);
        }
        
        setSnackbarMsg(`Too many failed attempts. Account locked for ${formatLockoutTime()}.`);
      }
      // Handle attempts remaining (401)
      else if (error.response?.status === 401) {
        const message = error.response.data.detail || '';
        const attemptsMatch = message.match(/(\d+) attempts remaining/);
        
        if (attemptsMatch) {
          setRemainingAttempts(parseInt(attemptsMatch[1], 10));
        }
        
        setSnackbarMsg(message || 'Login failed');
      } 
      else {
        setSnackbarMsg(error.response?.data?.detail || 'Login failed');
      }
      
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <AuthenticationLayout title="Login">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLocked}
        />
        <TextField
          label="Password"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLocked}
          error={remainingAttempts < 3}
          helperText={remainingAttempts < 3 ? `${remainingAttempts} attempts remaining` : ''}
        />
        
        {isLocked ? (
          <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
            <Typography variant="body1" color="error" gutterBottom>
              Account is temporarily locked
            </Typography>
            <Typography variant="body2">
              Try again in {formatLockoutTime()}
            </Typography>
            <CircularProgress 
              size={24} 
              sx={{ mt: 2 }}
              variant="determinate" 
              value={(lockoutTimer / 300) * 100} 
            />
          </Box>
        ) : (
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        )}
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={1500}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Already have a verification code? <Link to="/confirm">Confirm Signup</Link>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Forgot your password? <Link to="/forgot-password">Reset Password</Link>
        </Typography>
      </Box>
    </AuthenticationLayout>
  );
};

export default Login; 