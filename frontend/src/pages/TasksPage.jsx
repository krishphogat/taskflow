import React, { useState, useEffect, useCallback } from 'react';
import { tasksAPI, categoriesAPI } from '../api';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];

const TaskModal = ({ task, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    category_id: task?.category_id || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, category_id: formData.category_id || null, due_date: formData.due_date || null };
      if (task?.id) {
        await tasksAPI.update(task.id, payload);
      } else {
        await tasksAPI.create(payload);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Save task error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task?.id ? '✏️ Edit Task' : '➕ New Task'}</h2>
          <button id="task-modal-close" className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input id="task-title-input" type="text" name="title" className="form-input" placeholder="What needs to be done?" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea id="task-desc-input" name="description" className="form-textarea" placeholder="Add more details..." value={formData.description} onChange={handleChange} style={{ minHeight: '80px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select id="task-priority-select" name="priority" className="form-select" value={formData.priority} onChange={handleChange}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select id="task-status-select" name="status" className="form-select" value={formData.status} onChange={handleChange}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input id="task-due-date" type="date" name="due_date" className="form-input" value={formData.due_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select id="task-category-select" name="category_id" className="form-select" value={formData.category_id} onChange={handleChange}>
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button id="task-cancel-btn" type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="task-save-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" />Saving...</> : (task?.id ? '💾 Update Task' : '✨ Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TasksPage = ({ initialState }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', category_id: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, catsRes] = await Promise.all([
        tasksAPI.getAll({ ...filters }),
        categoriesAPI.getAll(),
      ]);
      setTasks(tasksRes.data.data);
      setCategories(catsRes.data.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (initialState?.openCreate) setModalOpen(true); }, [initialState]);

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showToast('Task deleted!', 'success');
    } catch { showToast('Failed to delete task.', 'error'); }
  };

  const handleQuickStatus = async (task, newStatus) => {
    try {
      await tasksAPI.update(task.id, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      showToast('Task updated!');
    } catch { showToast('Failed to update task.', 'error'); }
  };

  const getDueStatus = (dueDate, status) => {
    if (!dueDate || status === 'completed') return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Overdue', cls: 'overdue' };
    if (diffDays === 0) return { label: 'Due today', cls: 'today' };
    if (diffDays <= 3) return { label: `${diffDays}d left`, cls: 'upcoming' };
    return null;
  };

  return (
    <div className="fade-in">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
          </div>
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">My Tasks 📋</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
        </div>
        <button id="open-create-task-btn" className="btn btn-primary" onClick={() => { setEditTask(null); setModalOpen(true); }}>
          ➕ New Task
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="task-search-input"
            type="text"
            className="form-input search-input"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <select id="filter-status" className="form-select" style={{ width: 'auto' }} value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
        <select id="filter-priority" className="form-select" style={{ width: 'auto' }} value={filters.priority} onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}>
          <option value="">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select id="filter-category" className="form-select" style={{ width: 'auto' }} value={filters.category_id} onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3 className="empty-title">No tasks found</h3>
          <p className="empty-desc">
            {Object.values(filters).some(Boolean) ? 'Try adjusting your filters' : 'Create your first task to get started!'}
          </p>
          <button id="empty-create-task-btn" className="btn btn-primary" onClick={() => { setEditTask(null); setModalOpen(true); }}>
            ➕ Create Task
          </button>
        </div>
      ) : (
        <div className="tasks-container">
          {tasks.map(task => {
            const dueStatus = getDueStatus(task.due_date, task.status);
            return (
              <div key={task.id} className={`task-card ${task.status === 'completed' ? 'completed' : ''}`} style={{ '--task-color': task.category_color || 'var(--accent)' }}>
                <div className="task-header">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    <input
                      type="checkbox"
                      id={`task-check-${task.id}`}
                      checked={task.status === 'completed'}
                      onChange={() => handleQuickStatus(task, task.status === 'completed' ? 'pending' : 'completed')}
                      style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: 'var(--accent)', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="task-title">{task.title}</div>
                      {task.description && <div className="task-description">{task.description}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                    <span className={`badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                    <div className="task-actions">
                      <button id={`edit-task-${task.id}`} className="btn btn-ghost btn-icon" title="Edit" onClick={() => { setEditTask(task); setModalOpen(true); }}>✏️</button>
                      <button id={`delete-task-${task.id}`} className="btn btn-danger btn-icon" title="Delete" onClick={() => handleDelete(task.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
                <div className="task-footer">
                  {task.category_name && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span className="category-dot" style={{ background: task.category_color }} />
                      {task.category_name}
                    </span>
                  )}
                  {dueStatus && <span className={`due-date ${dueStatus.cls}`}>📅 {dueStatus.label}</span>}
                  {task.due_date && <span className="due-date">📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editTask}
          categories={categories}
          onClose={() => { setModalOpen(false); setEditTask(null); }}
          onSave={() => { fetchData(); showToast(editTask ? 'Task updated!' : 'Task created!'); }}
        />
      )}
    </div>
  );
};

export default TasksPage;
