// frontend/src/components/EventPage.jsx
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  Container,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';
import EventTable from './EventTable';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import config from '../config';

const drawerWidth = 240;

const EventPage = ({ onLogout, user }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/events`, {
        params: { page, search: searchQuery, per_page: perPage }
      });
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, searchQuery, perPage]);

  const handleDelete = async () => {
    console.log(`Deleting event with ID: ${selectedEvent.id}`);
    try {
      await axios.delete(`${config.apiBaseUrl}/events/${selectedEvent.id}`);
      setOpenDeleteDialog(false);
      fetchEvents();
      console.log(`Successfully deleted event with ID: ${selectedEvent.id}`);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setOpenEditDrawer(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const dateValue = formData.get('date');
      const formattedDate = new Date(dateValue).toISOString(); // Convert to ISO string
      
      // Optional: Log the data for debugging
      console.log({
        title: formData.get('title'),
        description: formData.get('description'),
        date: formattedDate
      });

      await axios.post(`${config.apiBaseUrl}/events/`, {
        title: formData.get('title'),
        description: formData.get('description'),
        date: formattedDate
      });
      setOpenCreateDrawer(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const dateValue = formData.get('date');
      const formattedDate = new Date(dateValue).toISOString();
      await axios.put(`${config.apiBaseUrl}/events/${selectedEvent.id}`, {
        title: formData.get('title'),
        description: formData.get('description'),
        date: formattedDate
      });
      setOpenEditDrawer(false);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const drawer = (
    <div>
      <List>
        <ListItem button onClick={() => setOpenCreateDrawer(true)}>
          <Typography variant="body1" sx={{ pl: 2 }}>
            Create Event
          </Typography>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#2575fc' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Events Dashboard
          </Typography>
          <Button color="inherit" onClick={onLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#f0f2f5' },
        }}
      >
        <Toolbar />
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12} sx={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <Paper elevation={6} sx={{ p: 3, border: '1px solidrgb(31, 31, 31)', borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>
                  Events
                </Typography>
                <TextField
                  label="Search Events"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={searchQuery}
                  onChange={handleSearch}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#ddd',
                      },
                      '&:hover fieldset': {
                        borderColor: '#2575fc',
                      },
                    },
                  }}
                />
                <EventTable events={events} fetchEvents={fetchEvents} onEdit={handleEdit} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <InputLabel>Per Page</InputLabel>
                      <Select
                        value={perPage}
                        onChange={(e) => {
                          setPerPage(e.target.value);
                          setPage(1);
                        }}
                        label="Per Page"
                        sx={{ height: 40 }}
                      >
                        {[5, 10, 20, 30, 40, 50].map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Showing {events.length} of {totalPages * perPage} events
                    </Typography>
                  </Box>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    shape="rounded"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        '&.Mui-selected': {
                          backgroundColor: '#2575fc',
                          color: '#fff',
                          borderColor: '#2575fc',
                        },
                      },
                    }}
                  />
                </Box>
                {user?.role === "admin" && (
                  <Button onClick={() => navigate('/create-event')}>Create Event</Button>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={openEditDrawer}
        onClose={() => setOpenEditDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 400,
            padding: 3,
            backgroundColor: '#f0f2f5'
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Edit Event</Typography>
          <IconButton onClick={() => setOpenEditDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleUpdateEvent}>
          <TextField
            label="Title"
            name="title"
            fullWidth
            margin="normal"
            defaultValue={selectedEvent?.title}
            required
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            defaultValue={selectedEvent?.description}
          />
          <TextField
            label="Date and Time"
            name="date"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            defaultValue={selectedEvent?.date ? new Date(selectedEvent.date).toISOString().slice(0, 16) : ''}
            required
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            sx={{ mt: 2 }}
          >
            Update Event
          </Button>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={openCreateDrawer}
        onClose={() => setOpenCreateDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 400,
            padding: 3,
            backgroundColor: '#f0f2f5'
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Create New Event</Typography>
          <IconButton onClick={() => setOpenCreateDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleCreateEvent}>
          <TextField
            label="Title"
            name="title"
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            label="Date and Time"
            name="date"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            sx={{ mt: 2 }}
          >
            Create Event
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default EventPage;