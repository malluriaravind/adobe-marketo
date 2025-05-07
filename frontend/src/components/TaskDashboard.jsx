import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const TaskDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/tasks/dashboard`, {
        params: { user_id: user.id }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    }
  };

  // Fetch completed tasks from the separate completed_tasks table
  const fetchCompletedTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/completed-tasks`, {
        params: { user_id: user.id }
      });
      setCompletedTasks(response.data);
    } catch (error) {
      console.error('Error fetching completed tasks', error);
    }
  };

  // Run fetchDashboard and fetchCompletedTasks once user is available
  useEffect(() => {
    // Ensure user and user.id are defined to prevent sending an undefined value for user_id
    if (user && user.id) {
      fetchDashboard();
      fetchCompletedTasks();
    }
  }, [user]);

  // If there is no dashboard data, show a loading message.
  if (!dashboardData) {
    return <Typography>Loading dashboard...</Typography>;
  }

  const data = [
    { name: 'Pending', value: dashboardData.pending },
    { name: 'Completed', value: dashboardData.completed }
  ];

  const COLORS = ['#FFBB28', '#00C49F'];

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        User Task Progress
      </Typography>
      <Button variant="contained" onClick={() => navigate('/tasks')} sx={{ mb: 2 }}>
        Back to Tasks
      </Button>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Total Tasks: {dashboardData.total}. Completion Rate: {dashboardData.completion_rate.toFixed(2)}%
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Completed Tasks
      </Typography>

      {completedTasks.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Completed At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{new Date(task.due_date).toLocaleString()}</TableCell>
                  <TableCell>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </TableCell>
                  <TableCell>{new Date(task.completed_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No completed tasks found.</Typography>
      )}
    </Paper>
  );
};

export default TaskDashboard; 