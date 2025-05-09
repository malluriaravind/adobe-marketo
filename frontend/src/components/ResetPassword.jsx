import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Snackbar, Alert, Typography } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthenticationLayout from './AuthenticationLayout';
import config from '../config';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setSnackbarMsg('Passwords do not match');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/auth/reset-password`,
        { email, code, password }
      );
      setSnackbarMsg(response.data.message || 'Password reset successful');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Password Reset Error', error);
      setSnackbarMsg(error.response?.data?.detail || 'Failed to reset password');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <AuthenticationLayout title="Reset Password">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={!!searchParams.get('email')}
        />
        <TextField
          label="Verification Code"
          fullWidth
          margin="normal"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <TextField
          label="New Password"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Confirm New Password"
          fullWidth
          margin="normal"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Reset Password
        </Button>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
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
          Remember your password? <Link to="/login">Login</Link>
        </Typography>
      </Box>
    </AuthenticationLayout>
  );
};

export default ResetPassword; 