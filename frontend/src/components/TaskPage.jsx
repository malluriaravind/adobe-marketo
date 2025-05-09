import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Pagination, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

// ADD: Import icons from Material UI
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningIcon from '@mui/icons-material/Warning';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LowPriorityIcon from '@mui/icons-material/LowPriority';

const TaskPage = ({ onLogout, user }) => {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Create Task Modal state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  // Edit Task Modal state (for inline editing)
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editStatus, setEditStatus] = useState('pending');

  // ADD: Helper functions to render icons based on priority and status
  const renderPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <WarningIcon style={{ verticalAlign: 'middle', marginRight: 4 }} color="error" />;
      case 'high':
        return <PriorityHighIcon style={{ verticalAlign: 'middle', marginRight: 4 }} color="warning" />;
      case 'medium':
        return <PriorityHighIcon style={{ verticalAlign: 'middle', marginRight: 4 }} color="info" />;
      case 'low':
        return <LowPriorityIcon style={{ verticalAlign: 'middle', marginRight: 4 }} color="success" />;
      default:
        return null;
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon style={{ verticalAlign: 'middle', marginRight: 4 }} color="success" />;
      case 'pending':
        return <HourglassEmptyIcon style={{ verticalAlign: 'middle', marginRight: 4 }} color="warning" />;
      default:
        return null;
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/tasks`, {
        params: { user_id: user.id, page, per_page: 10 }
      });
      setTasks(response.data.tasks);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const markTaskAsComplete = async (task) => {
    try {
      // Prepare the updated task data with status "completed"
      const updatedTask = {
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        status: "completed",
        priority: task.priority,
        user_id: task.user_id
      };
      await axios.put(`${config.apiBaseUrl}/tasks/${task.id}`, updatedTask);
      
      // Optimistically update state: remove the task from the active tasks list.
      setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
    } catch (error) {
      console.error("Error marking task complete:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${config.apiBaseUrl}/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.apiBaseUrl}/tasks/`, {
        title: newTitle,
        description: newDescription,
        due_date: newDueDate,
        priority: newPriority,
        user_id: user.id
      });
      setOpenCreateDialog(false);
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setNewPriority('medium');
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditClick = (task) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditDueDate(new Date(task.due_date).toISOString().slice(0, 16));
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setOpenEditDialog(true);
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.apiBaseUrl}/tasks/${editTaskId}`, {
        title: editTitle,
        description: editDescription,
        due_date: editDueDate,
        priority: editPriority,
        status: editStatus,
        user_id: user.id
      });
      setOpenEditDialog(false);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Tasks
      </Typography>
      <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
        Create Task
      </Button>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{new Date(task.due_date).toLocaleString()}</TableCell>
                <TableCell>
                  {renderPriorityIcon(task.priority)}
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </TableCell>
                <TableCell>
                  {renderStatusIcon(task.status)}
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </TableCell>
                <TableCell>
                  {task.status === 'pending' && (
                    <Button variant="contained" color="success" onClick={() => markTaskAsComplete(task)} size="small">
                      Mark as Complete
                    </Button>
                  )}
                  <Button variant="outlined" onClick={() => handleEditClick(task)} sx={{ ml: 1 }}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => deleteTask(task.id)} sx={{ ml: 1 }}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(e, value) => setPage(value)}
        sx={{ mt: 3 }}
      />

      {/* Create Task Modal */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Task</DialogTitle>
        <form onSubmit={handleCreateTask}>
          <DialogContent>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <TextField
              label="Due Date"
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="create-priority-label">Priority</InputLabel>
              <Select
                labelId="create-priority-label"
                label="Priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Create Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task</DialogTitle>
        <form onSubmit={handleEditTask}>
          <DialogContent>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <TextField
              label="Due Date"
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-priority-label">Priority</InputLabel>
              <Select
                labelId="edit-priority-label"
                label="Priority"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
              >
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Update Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TaskPage; 