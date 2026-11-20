import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../api';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];
const ICONS = ['📁', '💼', '👤', '📚', '🏠', '💡', '🎯', '🌟', '🚀', '💻', '🎨', '📊'];

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#6366f1', icon: '📁' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data);
    } catch { console.error('Failed to fetch categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditCat(null); setForm({ name: '', color: '#6366f1', icon: '📁' }); setModalOpen(true); };
  const openEdit = (cat) => { setEditCat(cat); setForm({ name: cat.name, color: cat.color, icon: cat.icon }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCat) {
        await categoriesAPI.update(editCat.id, form);
      } else {
        await categoriesAPI.create(form);
      }
      setModalOpen(false);
      await fetchCategories();
      showToast(editCat ? 'Category updated!' : 'Category created!');
    } catch { showToast('Failed to save category.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Tasks will not be deleted.')) return;
    try {
      await categoriesAPI.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Category deleted!');
    } catch { showToast('Failed to delete.', 'error'); }
  };

  return (
    <div className="fade-in">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Categories 🏷️</h1>
          <p className="page-subtitle">Organize your tasks into categories</p>
        </div>
        <button id="open-create-category-btn" className="btn btn-primary" onClick={openCreate}>➕ New Category</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {categories.map(cat => (
            <div key={cat.id} className="glass" style={{ padding: '24px', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: cat.color }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>{cat.icon}</div>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{cat.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{cat.task_count || 0} tasks</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button id={`edit-cat-${cat.id}`} className="btn btn-ghost btn-icon" onClick={() => openEdit(cat)}>✏️</button>
                  <button id={`delete-cat-${cat.id}`} className="btn btn-danger btn-icon" onClick={() => handleDelete(cat.id)}>🗑️</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{cat.color}</span>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <button id="add-category-card" className="glass" onClick={openCreate}
            style={{ padding: '24px', cursor: 'pointer', border: '1px dashed rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '160px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
          >
            <span style={{ fontSize: '32px' }}>➕</span>
            <span style={{ fontWeight: '600', color: 'var(--accent-light)' }}>Add Category</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editCat ? '✏️ Edit Category' : '➕ New Category'}</h2>
              <button id="category-modal-close" className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input id="cat-name-input" type="text" className="form-input" placeholder="e.g. Work, Personal..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" id={`color-${c.replace('#', '')}`}
                      onClick={() => setForm(p => ({ ...p, color: c }))}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none', transition: 'all 0.2s' }}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ICONS.map(icon => (
                    <button key={icon} type="button" id={`icon-${icon}`}
                      onClick={() => setForm(p => ({ ...p, icon }))}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', background: form.icon === icon ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', border: form.icon === icon ? '1px solid var(--accent)' : '1px solid var(--border)', cursor: 'pointer', fontSize: '20px', transition: 'all 0.2s' }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button id="cat-cancel-btn" type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button id="cat-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" />Saving...</> : (editCat ? '💾 Update' : '✨ Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
