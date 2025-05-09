import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

const AuthenticationLayout = ({ title, children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 1, color: '#FA0F00' }}>
            Adobe Marketo
          </Typography>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
            {title}
          </Typography>
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthenticationLayout; 