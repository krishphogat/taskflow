import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">✅</div>
          <span style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #818cf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TaskFlow
          </span>
        </div>

        <h1 className="auth-title">
          {mode === 'login' ? 'Welcome back! 👋' : 'Create your account'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to manage your tasks'
            : 'Start organizing your work today'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group fade-in">
              <label className="form-label">Full Name</label>
              <input
                id="auth-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="Krish Phogat"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="auth-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="krish@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="auth-password"
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', color: '#fca5a5', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ marginTop: '4px' }}
          >
            {loading ? (
              <><div className="spinner" />{mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
            ) : (
              mode === 'login' ? '🚀 Sign In' : '✨ Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? (
            <>Don't have an account? <span className="auth-link" onClick={() => { setMode('register'); setError(''); }}>Sign up</span></>
          ) : (
            <>Already have an account? <span className="auth-link" onClick={() => { setMode('login'); setError(''); }}>Sign in</span></>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
