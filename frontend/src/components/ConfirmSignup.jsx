import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Snackbar, Alert, Typography } from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthenticationLayout from './AuthenticationLayout';
import config from '../config';

const ConfirmSignup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  
  const [code, setCode] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!email) {
      setSnackbarMsg("Missing email. Please sign up again.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const response = await axios.post(`${config.apiBaseUrl}/auth/confirm`, { email, code });
      setSnackbarMsg("Verification successful! You can now log in.");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error("Confirmation Error", error);
      setSnackbarMsg(error.response?.data?.detail || 'Confirmation failed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <AuthenticationLayout title="Confirm Signup">
      {email ? (
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          A verification code was sent to <strong>{email}</strong>. Please enter the code below.
        </Typography>
      ) : (
        <Typography variant="body1" align="center" sx={{ mb: 2, color: 'red' }}>
          No email address was found. Please complete the signup process again.
        </Typography>
      )}
      <form onSubmit={handleConfirm}>
        <TextField 
          label="Verification Code" 
          variant="outlined" 
          fullWidth 
          margin="normal"
          value={code}
          onChange={(e) => setCode(e.target.value)} 
        />
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          type="submit" 
          sx={{ mt: 2 }}
          disabled={!email}
        >
          Confirm Signup
        </Button>
      </form>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2">
          Already confirmed? <Link to="/login">Login here</Link>
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

export default ConfirmSignup; 