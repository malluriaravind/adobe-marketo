import { Link } from 'react-router-dom';
import { Box } from '@mui/material';

const Navigation = ({ user }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Link to="/events">Events</Link>
      <Link to="/create-event">Create Event</Link>
      {user?.isAdmin && <Link to="/user-management">User Management</Link>}
    </Box>
  );
};

export default Navigation; 