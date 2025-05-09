import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Snackbar, Alert, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationLayout from './AuthenticationLayout';
import config from '../config';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.apiBaseUrl}/auth/signup`, { email, password });
      setSnackbarMsg('Signup successful. A verification code has been sent to your email.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/confirm', { state: { email } });
      }, 1500);
    } catch (error) {
      console.error("Signup Error", error);
      setSnackbarMsg(error.response?.data?.detail || 'Signup failed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <AuthenticationLayout title="Sign Up">
      <form onSubmit={handleSubmit}>
        <TextField 
          label="Email" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <TextField 
          label="Password" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <Button variant="contained" color="primary" fullWidth type="submit" sx={{ mt: 2 }}>
          Sign Up
        </Button>
      </form>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2">
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </AuthenticationLayout>
  );
};

export default Signup; 