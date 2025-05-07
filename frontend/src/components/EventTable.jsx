import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const EventTable = ({ events, fetchEvents, onEdit }) => {
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event", error);
      alert("Failed to delete event");
    }
  };

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        width: '98%',
        margin: '0 auto',
        boxShadow: 3,
        borderRadius: 2,
        mt: 1,
        mb: 1
      }}
    >
      <Table sx={{ width: '100%' }} aria-label="events table">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
            <TableCell sx={{ fontWeight: 600, color: '#495057', py: 1.5 }}>Event ID</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#495057', py: 1.5 }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#495057', py: 1.5 }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#495057', py: 1.5 }}>Date</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, color: '#495057', py: 1.5 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow 
              key={event.id} 
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { 
                  backgroundColor: '#f8f9fa',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <TableCell sx={{ fontSize: '0.85rem', padding: '4px' }}>{event.id}</TableCell>
              <TableCell sx={{ fontSize: '0.85rem', padding: '4px' }}>{event.title}</TableCell>
              <TableCell sx={{ fontSize: '0.85rem', padding: '4px', whiteSpace: 'normal' }}>{event.description}</TableCell>
              <TableCell sx={{ fontSize: '0.85rem', padding: '4px' }}>{new Date(event.date).toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ padding: '4px' }}>
                <IconButton 
                  onClick={() => onEdit(event)} 
                  color="primary"
                  sx={{ '&:hover': { backgroundColor: '#e3f2fd' }, padding: '2px' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(event.id)} 
                  color="error"
                  sx={{ '&:hover': { backgroundColor: '#ffebee' }, padding: '2px' }}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EventTable; 