import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Snackbar, Alert, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationLayout from './AuthenticationLayout';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8000/auth/login',
        { email, password },
        { withCredentials: true }
      );
      onLogin(response.data);
      setSnackbarMsg(response.data.message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/events');
      }, 1500);
    } catch (error) {
      console.error('Login Error', error);
      setSnackbarMsg(error.response?.data?.detail || 'Login failed');
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
        />
        <TextField
          label="Password"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
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
      </Box>
    </AuthenticationLayout>
  );
};

export default Login; 