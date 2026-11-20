import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import CategoriesPage from './pages/CategoriesPage';
import './index.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'tasks', icon: '📋', label: 'My Tasks' },
  { id: 'categories', icon: '🏷️', label: 'Categories' },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [pageState, setPageState] = useState(null);

  const navigate = (newPage, state = null) => {
    setPage(newPage);
    setPageState(state);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'tasks': return <TasksPage initialState={pageState} />;
      case 'categories': return <CategoriesPage />;
      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">✅</div>
          <span className="brand-name">TaskFlow</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Navigation</span>
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
              role="button"
              tabIndex={0}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="sidebar-user" id="sidebar-user-menu">
          <div className="user-avatar" style={{ background: user?.avatar_color || '#6366f1' }}>
            {getInitials(user?.name)}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
          <button
            id="logout-btn"
            className="btn btn-ghost btn-icon"
            title="Logout"
            onClick={logout}
            style={{ flexShrink: 0 }}
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div className="brand-icon" style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✅</div>
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading TaskFlow...</span>
      </div>
    );
  }

  return user ? <AppLayout /> : <AuthPage />;
};

const Root = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default Root;
