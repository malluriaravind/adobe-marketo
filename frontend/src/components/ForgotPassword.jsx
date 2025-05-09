import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Snackbar, Alert, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthenticationLayout from './AuthenticationLayout';
import config from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(`Sending request to ${config.apiBaseUrl}/auth/forgot-password`);
      const response = await axios.post(
        `${config.apiBaseUrl}/auth/forgot-password`,
        { email },
        {
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      setSnackbarMsg(response.data.message || 'Password reset link sent to your email');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSent(true);
    } catch (error) {
      console.error('Forgot Password Error', error);
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        setSnackbarMsg(`Server error: ${error.response.status} - ${error.response?.data?.detail || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        setSnackbarMsg("No response received from server. Check if backend is running.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        setSnackbarMsg(`Error: ${error.message}`);
      }
      
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticationLayout title="Forgot Password">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {!sent ? (
          <>
            <Typography variant="body1" gutterBottom>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </>
        ) : (
          <Typography variant="body1">
            Check your email for the password reset link. Return to <Link to="/login">Login</Link>
          </Typography>
        )}
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

export default ForgotPassword; 