import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../api';

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await tasksAPI.getStats();
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        // Show demo stats if API not connected
        setStats({
          stats: { total: 24, pending: 8, in_progress: 5, completed: 10, cancelled: 1, overdue: 3, urgent: 2 },
          recentTasks: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Tasks', value: stats?.stats?.total || 0, icon: '📋', color: '#6366f1' },
    { label: 'In Progress', value: stats?.stats?.in_progress || 0, icon: '⚡', color: '#06b6d4' },
    { label: 'Completed', value: stats?.stats?.completed || 0, icon: '✅', color: '#10b981' },
    { label: 'Pending', value: stats?.stats?.pending || 0, icon: '⏳', color: '#f59e0b' },
    { label: 'Overdue', value: stats?.stats?.overdue || 0, icon: '🔥', color: '#ef4444' },
    { label: 'Urgent', value: stats?.stats?.urgent || 0, icon: '🚨', color: '#ec4899' },
  ];

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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '12px' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">
          Dashboard <span style={{ fontSize: '24px' }}>🏠</span>
        </h1>
        <p className="page-subtitle">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ '--stat-color': card.color }}>
            <span className="stat-icon">{card.icon}</span>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <button
          id="dashboard-new-task-btn"
          className="glass"
          style={{ padding: '24px', textAlign: 'left', cursor: 'pointer', border: '1px dashed rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.05)', transition: 'all 0.2s' }}
          onClick={() => onNavigate('tasks', { openCreate: true })}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>➕</div>
          <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>Create New Task</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Add a task to your workflow</div>
        </button>

        <button
          id="dashboard-view-tasks-btn"
          className="glass"
          style={{ padding: '24px', textAlign: 'left', cursor: 'pointer', border: '1px dashed rgba(6,182,212,0.4)', background: 'rgba(6,182,212,0.05)', transition: 'all 0.2s' }}
          onClick={() => onNavigate('tasks')}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>View All Tasks</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Manage your task list</div>
        </button>
      </div>

      {/* Recent Tasks */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Recent Tasks</h2>
        {stats?.recentTasks?.length > 0 ? (
          <div className="tasks-container">
            {stats.recentTasks.map(task => {
              const dueStatus = getDueStatus(task.due_date, task.status);
              return (
                <div key={task.id} className={`task-card ${task.status === 'completed' ? 'completed' : ''}`} style={{ '--task-color': task.category_color || 'var(--accent)' }}>
                  <div className="task-header">
                    <span className="task-title">{task.title}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                      <span className={`badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
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
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>No tasks yet!</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Create your first task to get started.</div>
            <button id="dashboard-first-task-btn" className="btn btn-primary" onClick={() => onNavigate('tasks', { openCreate: true })}>
              ➕ Create First Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
