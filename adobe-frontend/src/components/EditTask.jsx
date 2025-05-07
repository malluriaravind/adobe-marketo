import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// ADD: Import icons for status and priority
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningIcon from '@mui/icons-material/Warning';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LowPriorityIcon from '@mui/icons-material/LowPriority';

const EditTask = ({ user }) => {
  const { taskId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/tasks/${taskId}`);
        const task = response.data;
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(new Date(task.due_date).toISOString().slice(0, 16));
        setStatus(task.status);
        setPriority(task.priority);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/tasks/${taskId}`, {
        title,
        description,
        due_date: dueDate,
        status,
        priority,
        user_id: user.id
      });
      navigate('/tasks');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Task
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Due Date"
          type="datetime-local"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        {/* ADD: Priority dropdown with icons in MenuItems */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="critical">
              <WarningIcon style={{ marginRight: 4 }} color="error" /> Critical
            </MenuItem>
            <MenuItem value="high">
              <PriorityHighIcon style={{ marginRight: 4 }} color="warning" /> High
            </MenuItem>
            <MenuItem value="medium">
              <PriorityHighIcon style={{ marginRight: 4 }} color="info" /> Medium
            </MenuItem>
            <MenuItem value="low">
              <LowPriorityIcon style={{ marginRight: 4 }} color="success" /> Low
            </MenuItem>
          </Select>
        </FormControl>
        {/* ADD: Status dropdown with icons */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="pending">
              <HourglassEmptyIcon style={{ marginRight: 4 }} color="warning" /> Pending
            </MenuItem>
            <MenuItem value="completed">
              <CheckCircleIcon style={{ marginRight: 4 }} color="success" /> Completed
            </MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Update Task
        </Button>
      </form>
    </Box>
  );
};

export default EditTask; 