import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { authAPI, projectAPI, taskAPI, commentAPI } from './services/api';
import './App.css';

// ========================================
// AUTH CONTEXT
// ========================================
const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, name, email: userEmail } = response.data;
      const userData = { name, email: userEmail };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      await authAPI.register({ name, email, password });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// ========================================
// PRIVATE ROUTE
// ========================================
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// ========================================
// NAVBAR
// ========================================
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-brand-modern">
        <span className="brand-icon">📋</span>
        <span className="brand-name">Task Manager</span>
      </div>
      <div className="navbar-user-modern">
        <span className="user-name">👤 {user?.name}</span>
        <button onClick={() => setShowProfile(!showProfile)} className="btn-profile-modern">⚙️ Profile</button>
        <button onClick={handleLogout} className="btn-logout-modern">Logout</button>
      </div>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </nav>
  );
};

// ========================================
// PROFILE MODAL
// ========================================
const ProfileModal = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const updateData = { name, email };
    if (password) {
      updateData.password = password;
    }

    const result = await updateProfile(updateData);
    if (result.success) {
      setMessage('Profile updated successfully!');
      setTimeout(() => onClose(), 1500);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Edit Profile</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary-modern">
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ========================================
// LOGIN
// ========================================
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container-modern">
      <div className="auth-card-modern">
        <h2>Welcome Back</h2>
        <p>Login to your account</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-login-modern">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

// ========================================
// REGISTER
// ========================================
const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await register(name, email, password);
    if (result.success) {
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container-modern">
      <div className="auth-card-modern">
        <h2>Create Account</h2>
        <p>Register to get started</p>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-register-modern">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

// ========================================
// TASK DETAIL MODAL
// ========================================
const TaskDetailModal = ({ task, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'HIGH': { label: '🔴 High', class: 'priority-high' },
      'MEDIUM': { label: '🟡 Medium', class: 'priority-medium' },
      'LOW': { label: '🟢 Low', class: 'priority-low' },
    };
    const priorityInfo = priorityMap[priority] || priorityMap['MEDIUM'];
    return <span className={`priority-badge ${priorityInfo.class}`}>{priorityInfo.label}</span>;
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await taskAPI.toggle(task.id);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error toggling task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Task Details</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="task-detail-content">
          <div className="task-detail-row">
            <span className="task-detail-label">Title</span>
            <span className="task-detail-value">{task.title}</span>
          </div>
          <div className="task-detail-row">
            <span className="task-detail-label">Description</span>
            <span className="task-detail-value">{task.description || 'No description'}</span>
          </div>
          <div className="task-detail-row">
            <span className="task-detail-label">Status</span>
            <span className={`task-detail-value ${task.completed ? 'completed' : 'pending'}`}>
              {task.completed ? '✅ Completed' : '⏳ In Progress'}
            </span>
          </div>
          <div className="task-detail-row">
            <span className="task-detail-label">Priority</span>
            <span className="task-detail-value">{getPriorityBadge(task.priority)}</span>
          </div>
          <div className="task-detail-row">
            <span className="task-detail-label">Due Date</span>
            <span className="task-detail-value">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            </span>
          </div>
          <div className="task-detail-row">
            <span className="task-detail-label">Project</span>
            <span className="task-detail-value">{task.projectName || 'N/A'}</span>
          </div>
        </div>
        <div className="task-detail-actions">
          <button 
            onClick={handleToggleStatus} 
            disabled={loading}
            className={task.completed ? 'btn-pending-modern' : 'btn-done-modern'}
          >
            {loading ? 'Updating...' : task.completed ? '↻ Mark In Progress' : '✅ Mark Done'}
          </button>
          <button onClick={onClose} className="btn-secondary-modern">Close</button>
        </div>
      </div>
    </div>
  );
};

// ========================================
// TASK FORM
// ========================================
const TaskForm = ({ projectId, onTaskAdded, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await taskAPI.create({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        priority: priority,
        project: { id: parseInt(projectId) },
        completed: false
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('MEDIUM');
      onTaskAdded();
    } catch (error) {
      setError(error.response?.data || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-modern">
      <div className="form-header">
        <h4>➕ Add New Task</h4>
        <button type="button" onClick={onCancel} className="btn-close-form">✕</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Task Title *</label>
          <input type="text" placeholder="Enter task title..." value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="Describe your task..." value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="HIGH">🔴 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </div>
        </div>
        <div className="task-form-actions">
          <button type="submit" disabled={loading} className="btn-primary-modern">
            {loading ? 'Adding...' : '✅ Add Task'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary-modern">Cancel</button>
        </div>
      </form>
    </div>
  );
};

// ========================================
// TASK ITEM - CLEAN VERSION
// ========================================
const TaskItem = ({ task, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editPriority, setEditPriority] = useState(task.priority || 'MEDIUM');

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'HIGH': { label: 'High', class: 'priority-high' },
      'MEDIUM': { label: 'Medium', class: 'priority-medium' },
      'LOW': { label: 'Low', class: 'priority-low' },
    };
    const priorityInfo = priorityMap[priority] || priorityMap['MEDIUM'];
    return <span className={`priority-badge ${priorityInfo.class}`}>{priorityInfo.label}</span>;
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      await taskAPI.toggle(task.id);
      onUpdate();
    } catch (error) {
      console.error('Error toggling task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      setLoading(true);
      try {
        await taskAPI.delete(task.id);
        onUpdate();
      } catch (error) {
        console.error('Error deleting task:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await taskAPI.update(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate || null,
        priority: editPriority,
        completed: task.completed
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getByTask(task.id);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await commentAPI.create({ content: newComment, task: { id: task.id } });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShowComments = () => {
    if (!showComments) fetchComments();
    setShowComments(!showComments);
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await commentAPI.delete(commentId);
        fetchComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleTaskClick = () => {
    setShowDetail(true);
  };

  if (isEditing) {
    return (
      <div className="task-edit-form-modern">
        <div className="form-header">
          <h4>✏️ Edit Task</h4>
          <button type="button" onClick={() => setIsEditing(false)} className="btn-close-form">✕</button>
        </div>
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input 
              type="text" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={editDescription} 
              onChange={(e) => setEditDescription(e.target.value)} 
              rows="2" 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date" 
                value={editDueDate} 
                onChange={(e) => setEditDueDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
          <div className="task-edit-actions">
            <button type="submit" disabled={loading} className="btn-primary-modern">
              {loading ? 'Saving...' : '💾 Save'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary-modern">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className={`task-item-modern ${task.completed ? 'task-completed' : ''}`}>
        <div className="task-item-left" onClick={handleTaskClick}>
          <input 
            type="checkbox" 
            checked={task.completed} 
            onChange={(e) => { e.stopPropagation(); handleToggle(); }} 
            disabled={loading} 
            className="task-checkbox-modern" 
            onClick={(e) => e.stopPropagation()}
          />
          <div className="task-content-modern">
            <div className="task-header-modern">
              <span className="task-title-modern">{task.title}</span>
              <span className="task-priority-modern">{getPriorityBadge(task.priority)}</span>
            </div>
            {task.description && <span className="task-description-modern">{task.description}</span>}
            <div className="task-footer-modern">
              {task.dueDate && (
                <span className="task-due-date-modern">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); handleShowComments(); }} 
                className="btn-comment-modern"
              >
                💬 {comments.length > 0 ? comments.length : ''}
              </button>
              <span className="task-click-hint-modern">Click for details</span>
            </div>
            {showComments && (
              <div className="comments-section" onClick={(e) => e.stopPropagation()}>
                <div className="comments-list">
                  {comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <span className="comment-user">{comment.userName}: </span>
                      <span className="comment-text">{comment.content}</span>
                      <button onClick={() => handleDeleteComment(comment.id)} className="btn-delete-comment">×</button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddComment} className="comment-form">
                  <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." />
                  <button type="submit">Post</button>
                </form>
              </div>
            )}
          </div>
        </div>
        <div className="task-item-actions-modern" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setIsEditing(true)} 
            className="btn-action-modern btn-edit-action" 
            title="Edit Task"
          >
            ✏️
          </button>
          <button 
            onClick={handleDelete} 
            className="btn-action-modern btn-delete-action" 
            title="Delete Task"
          >
            🗑️
          </button>
        </div>
      </div>

      {showDetail && (
        <TaskDetailModal 
          task={{ ...task, projectName: task.projectName || 'Current Project' }} 
          onClose={() => setShowDetail(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

// ========================================
// TASK LIST
// ========================================
const TaskList = ({ projectId, onUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [sortBy, setSortBy] = useState('dueDate');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getByProject(projectId);
      const tasksWithProject = response.data.map(task => ({
        ...task,
        projectName: 'Current Project'
      }));
      setTasks(tasksWithProject);
      setFilteredTasks(tasksWithProject);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    let result = [...tasks];

    if (filterStatus === 'COMPLETED') {
      result = result.filter(t => t.completed);
    } else if (filterStatus === 'IN_PROGRESS') {
      result = result.filter(t => !t.completed);
    }

    if (filterPriority !== 'ALL') {
      result = result.filter(t => t.priority === filterPriority);
    }

    if (sortBy === 'dueDate') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'priority') {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    setFilteredTasks(result);
  }, [tasks, filterStatus, filterPriority, sortBy]);

  const handleTaskUpdate = async () => {
    await fetchTasks();
    onUpdate();
  };

  if (loading) return <div className="loading-tasks">Loading tasks...</div>;

  return (
    <div className="task-list-modern">
      <div className="task-list-header-modern">
        <h4>📋 Tasks ({filteredTasks.length})</h4>
        <div className="task-filters-modern">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="COMPLETED">✅ Completed</option>
            <option value="IN_PROGRESS">⏳ In Progress</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="HIGH">🔴 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueDate">📅 Sort by Date</option>
            <option value="title">📝 Sort by Title</option>
            <option value="priority">🎯 Sort by Priority</option>
          </select>
        </div>
      </div>
      {filteredTasks.length === 0 ? (
        <div className="no-tasks-modern">No tasks match your filters</div>
      ) : (
        filteredTasks.map(task => <TaskItem key={task.id} task={task} onUpdate={handleTaskUpdate} />)
      )}
    </div>
  );
};

// ========================================
// PROJECT FORM
// ========================================
const ProjectForm = ({ onProjectAdded, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await projectAPI.create({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      onProjectAdded();
    } catch (error) {
      setError(error.response?.data || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-form-modern">
      <div className="form-header">
        <h3>📁 Create New Project</h3>
        <button type="button" onClick={onCancel} className="btn-close-form">✕</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Project Name *</label>
          <input type="text" placeholder="Enter project name..." value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="Describe your project..." value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
        </div>
        <div className="project-form-actions">
          <button type="submit" disabled={loading} className="btn-primary-modern">
            {loading ? 'Creating...' : '📁 Create Project'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary-modern">Cancel</button>
        </div>
      </form>
    </div>
  );
};

// ========================================
// PROJECT CARD
// ========================================
const ProjectCard = ({ project, onUpdate }) => {
  const [showTasks, setShowTasks] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status) => {
    const statusMap = {
      'ENDED': { label: '✅ Ended', class: 'status-ended-modern' },
      'RUNNING': { label: '🔄 Running', class: 'status-running-modern' },
      'PENDING': { label: '⏳ Pending', class: 'status-pending-modern' },
    };
    const statusInfo = statusMap[status] || statusMap['PENDING'];
    return <span className={`status-badge-modern ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getStatusIcon = (status) => {
    const icons = { 'ENDED': '✅', 'RUNNING': '🔄', 'PENDING': '⏳' };
    return icons[status] || '📋';
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await projectAPI.update(project.id, { name, description });
      onUpdate();
      setEditing(false);
    } catch (error) {
      alert('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this project?')) {
      setLoading(true);
      try {
        await projectAPI.delete(project.id);
        onUpdate();
      } catch (error) {
        alert('Failed to delete project');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      await projectAPI.create({ 
        name: `${project.name} (Copy)`, 
        description: project.description 
      });
      onUpdate();
      alert('✅ Project duplicated!');
    } catch (error) {
      alert('Failed to duplicate project');
    }
  };

  const getTimelineItems = () => {
    const tasks = project.tasks || [];
    return tasks.slice(0, 5).map((task, index) => ({
      id: task.id || index,
      title: task.title || `Task ${index + 1}`,
      date: task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date',
      status: task.completed ? 'Completed' : 'In Progress'
    }));
  };

  const timelineItems = getTimelineItems();

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="project-edit-form-modern">
        <div className="form-header">
          <h4>✏️ Edit Project</h4>
          <button type="button" onClick={() => setEditing(false)} className="btn-close-form">✕</button>
        </div>
        <div className="form-group">
          <label>Project Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="2" />
        </div>
        <div className="project-actions-modern">
          <button type="submit" disabled={loading} className="btn-primary-modern">💾 Save</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary-modern">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="project-card-modern">
      <div className="project-card-header-modern">
        <div className="project-card-title">
          <h3>{project.name}</h3>
          <span className="project-status-icon">{getStatusIcon(project.status)}</span>
        </div>
        {getStatusBadge(project.status)}
      </div>
      
      <p className="project-description-modern">{project.description || 'No description'}</p>
      
      <div className="project-progress-modern">
        <div className="progress-bar-modern">
          <div className="progress-fill-modern" style={{ width: `${project.progress || 0}%` }}></div>
        </div>
        <span className="progress-text-modern">{Math.round(project.progress || 0)}%</span>
      </div>
      
      <div className="project-stats-modern">
        <span>📋 Tasks: {project.totalTasks || 0}</span>
        <span>✅ Completed: {project.completedTasks || 0}</span>
      </div>

      <div className="project-timeline-modern">
        <h4>📅 Timeline</h4>
        {timelineItems.length === 0 ? (
          <p className="no-timeline">No tasks yet</p>
        ) : (
          timelineItems.map((item, index) => (
            <div key={index} className="timeline-item-modern">
              <span className="timeline-title">{item.title}</span>
              <span className="timeline-date">📅 {item.date}</span>
              <span className={`timeline-status ${item.status === 'Completed' ? 'done' : 'pending'}`}>
                {item.status === 'Completed' ? '✅ Done' : '⏳ In Progress'}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="project-card-actions-modern">
        <button onClick={() => setShowTasks(!showTasks)} className="btn-primary-modern">
          {showTasks ? 'Hide Tasks' : '📋 View Tasks'}
        </button>
        <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn-secondary-modern">➕ Task</button>
        <button onClick={handleDuplicate} className="btn-duplicate-modern" title="Duplicate">📋 Duplicate</button>
        <button onClick={() => setEditing(true)} className="btn-edit-modern" title="Edit">✏️ Edit</button>
        <button onClick={handleDelete} className="btn-delete-modern" title="Delete">🗑️ Delete</button>
      </div>

      {showTaskForm && (
        <TaskForm 
          projectId={project.id} 
          onTaskAdded={() => { setShowTaskForm(false); onUpdate(); }} 
          onCancel={() => setShowTaskForm(false)} 
        />
      )}
      {showTasks && <TaskList projectId={project.id} onUpdate={onUpdate} />}
    </div>
  );
};

// ========================================
// RECENT TASKS ITEM
// ========================================
const RecentTaskItem = ({ task, onUpdate }) => {
  const [showRecentDetail, setShowRecentDetail] = useState(false);

  return (
    <>
      <div 
        className="recent-task-item" 
        onClick={() => setShowRecentDetail(true)}
        style={{ cursor: 'pointer' }}
      >
        <div className="recent-task-info">
          <span className="recent-task-title">{task.title}</span>
          <span className="recent-task-project">📁 {task.projectName}</span>
        </div>
        <span className={`recent-task-status ${task.completed ? 'done' : 'pending'}`}>
          {task.completed ? '✅ Done' : '⏳ In Progress'}
        </span>
      </div>
      {showRecentDetail && (
        <TaskDetailModal 
          task={{ ...task, projectName: task.projectName || 'Current Project' }} 
          onClose={() => setShowRecentDetail(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

// ========================================
// DASHBOARD
// ========================================
const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [stats, setStats] = useState({ total: 0, ended: 0, running: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
      const total = response.data.length;
      const ended = response.data.filter(p => p.status === 'ENDED').length;
      const running = response.data.filter(p => p.status === 'RUNNING').length;
      const pending = response.data.filter(p => p.status === 'PENDING').length;
      setStats({ total, ended, running, pending });
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to load projects. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getAllTasks = () => {
    const allTasks = [];
    projects.forEach(project => {
      if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach(task => {
          allTasks.push({
            ...task,
            projectName: project.name,
            projectId: project.id
          });
        });
      }
    });
    return allTasks.slice(0, 5);
  };

  const allTasks = getAllTasks();

  const getWeeklyData = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return days.map(day => ({
      day,
      completed: Math.floor(Math.random() * 8) + 2,
      total: Math.floor(Math.random() * 5) + 8
    }));
  };

  const weeklyData = getWeeklyData();

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-modern">
      <div className="dashboard-header-modern">
        <div>
          <h1>Dashboard</h1>
          <p>Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <button className="btn-add-project-modern" onClick={() => setShowProjectForm(!showProjectForm)}>
          {showProjectForm ? '✕ Cancel' : '+ Add Project'}
        </button>
      </div>

      {showProjectForm && (
        <ProjectForm 
          onProjectAdded={() => { setShowProjectForm(false); fetchProjects(); }} 
          onCancel={() => setShowProjectForm(false)} 
        />
      )}

      <div className="stats-grid-modern">
        <div className="stats-card-modern stats-card-total">
          <div className="stats-card-icon">📊</div>
          <div className="stats-card-content">
            <h3>Total Projects</h3>
            <div className="stats-value">{stats.total}</div>
            <div className="stats-change positive">↑ Increased from last month</div>
          </div>
        </div>
        <div className="stats-card-modern stats-card-ended">
          <div className="stats-card-icon">✅</div>
          <div className="stats-card-content">
            <h3>Ended Projects</h3>
            <div className="stats-value">{stats.ended}</div>
            <div className="stats-change positive">↑ Increased from last month</div>
          </div>
        </div>
        <div className="stats-card-modern stats-card-running">
          <div className="stats-card-icon">🔄</div>
          <div className="stats-card-content">
            <h3>Running Projects</h3>
            <div className="stats-value">{stats.running}</div>
            <div className="stats-change positive">↑ Increased from last month</div>
          </div>
        </div>
        <div className="stats-card-modern stats-card-pending">
          <div className="stats-card-icon">⏳</div>
          <div className="stats-card-content">
            <h3>Pending Project</h3>
            <div className="stats-value">{stats.pending}</div>
            <div className="stats-change neutral">On Discussion</div>
          </div>
        </div>
      </div>

      <div className="dashboard-two-col">
        <div className="dashboard-left-col">
          <div className="analytics-card">
            <h3>📊 Project Analytics</h3>
            <div className="analytics-chart">
              {weeklyData.map((item, index) => (
                <div key={index} className="chart-bar-wrapper">
                  <div className="chart-bar" style={{ height: `${(item.completed / item.total) * 100}%` }}>
                    <span className="chart-value">{item.completed}</span>
                  </div>
                  <span className="chart-label">{item.day}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span>📈 Weekly task completion</span>
            </div>
          </div>

          <div className="recent-tasks-card">
            <h3>📋 Recent Tasks</h3>
            {allTasks.length === 0 ? (
              <p className="no-tasks-message">No tasks available</p>
            ) : (
              <div className="recent-tasks-list">
                {allTasks.map((task, index) => (
                  <RecentTaskItem key={index} task={task} onUpdate={fetchProjects} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-right-col">
          <div className="projects-section-modern">
            <div className="projects-header">
              <h2>📁 Your Projects</h2>
              <span className="project-count">{projects.length} projects</span>
            </div>
            {projects.length === 0 ? (
              <div className="no-projects-modern">
                <p>🚀 No projects yet. Create your first project!</p>
              </div>
            ) : (
              <div className="projects-grid-modern">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer-modern">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">📋 Task Manager</span>
            <p className="footer-text">Plan, prioritize, and accomplish your tasks with ease.</p>
          </div>
          <div className="footer-right">
            <p className="footer-copyright">© 2026 Task Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ========================================
// MAIN APP
// ========================================
const AppContent = () => {
  const { user } = useAuth();
  return (
    <div className="App">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;