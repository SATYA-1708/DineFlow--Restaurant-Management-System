import React, { useState, useEffect } from 'react'
import { menuAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  UtensilsCrossed,
  Plus,
  Search,
  FolderPlus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  Sparkles
} from 'lucide-react'

export default function MenuManagement() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [activeTab, setActiveTab] = useState('items')
  const [showItemModal, setShowItemModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editCat, setEditCat] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [loading, setLoading] = useState(true)
  const [itemForm, setItemForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isAvailable: true,
    estimatedMinutes: 15
  })
  const [catForm, setCatForm] = useState({ name: '', description: '', sortOrder: 0 })

  const load = () => {
    Promise.all([menuAPI.getCategories(), menuAPI.getItems()])
      .then(([c, i]) => {
        setCategories(c.data.data || [])
        setItems(i.data.data || [])
      })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filteredItems = items.filter(
    i =>
      (!search || i.name.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCat || String(i.categoryId) === String(filterCat))
  )

  const openEditItem = item => {
    setEditItem(item)
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || '',
      price: item.price,
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable,
      estimatedMinutes: item.estimatedMinutes || 15
    })
    setShowItemModal(true)
  }

  const openNewItem = () => {
    setEditItem(null)
    setItemForm({
      categoryId: categories[0]?.id || '',
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      isAvailable: true,
      estimatedMinutes: 15
    })
    setShowItemModal(true)
  }

  const openEditCat = cat => {
    setEditCat(cat)
    setCatForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0 })
    setShowCatModal(true)
  }

  const openNewCat = () => {
    setEditCat(null)
    setCatForm({ name: '', description: '', sortOrder: 0 })
    setShowCatModal(true)
  }

  const saveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.categoryId) {
      toast.error('Please fill in required fields (Category, Name, Price)')
      return
    }
    try {
      if (editItem) await menuAPI.updateItem(editItem.id, itemForm)
      else await menuAPI.createItem(itemForm)
      toast.success(editItem ? 'Dish updated successfully' : 'New dish created')
      setShowItemModal(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error saving item')
    }
  }

  const saveCat = async () => {
    if (!catForm.name.trim()) {
      toast.error('Category name is required')
      return
    }
    try {
      if (editCat) await menuAPI.updateCategory(editCat.id, catForm)
      else await menuAPI.createCategory(catForm)
      toast.success(editCat ? 'Category updated' : 'Category created')
      setShowCatModal(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error saving category')
    }
  }

  const toggleAvail = async id => {
    try {
      await menuAPI.toggleAvailability(id)
      load()
      toast.success('Availability toggled')
    } catch {
      toast.error('Failed to change status')
    }
  }

  const deleteItem = async id => {
    if (!confirm('Are you sure you want to delete this menu item?')) return
    try {
      await menuAPI.deleteItem(id)
      toast.success('Item deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-page">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      {/* ── Page Header ── */}
      <div className="flex-between page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1>
            <UtensilsCrossed size={28} style={{ color: 'var(--primary)' }} />
            Menu Catalog & Pricing
          </h1>
          <p>Curate menu categories, recipes, pricing tiers, and real-time dish availability</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={openNewCat}>
            <FolderPlus size={15} /> Add Category
          </button>
          <button className="btn btn-primary" onClick={openNewItem}>
            <Plus size={15} /> New Dish Item
          </button>
        </div>
      </div>

      {/* ── Tab Selector ── */}
      <div
        style={{
          display: 'inline-flex',
          gap: '4px',
          marginBottom: '24px',
          background: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border)'
        }}
      >
        <button
          onClick={() => setActiveTab('items')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            background: activeTab === 'items' ? '#fff' : 'transparent',
            color: activeTab === 'items' ? 'var(--text)' : 'var(--text-muted)',
            boxShadow: activeTab === 'items' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          Dishes & Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            background: activeTab === 'categories' ? '#fff' : 'transparent',
            color: activeTab === 'categories' ? 'var(--text)' : 'var(--text-muted)',
            boxShadow: activeTab === 'categories' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          Categories ({categories.length})
        </button>
      </div>

      {activeTab === 'items' && (
        <>
          {/* ── Search & Filter Controls ── */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--text-light)" />
              <input
                placeholder="Search dish by title or ingredients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '200px' }}
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* ── Items Data Table ── */}
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item Info</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Prep Time</th>
                    <th>Kitchen Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <div className="icon">
                            <UtensilsCrossed size={30} />
                          </div>
                          <h3>No menu items found</h3>
                          <p>Add new dishes or adjust your search filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '380px' }}>
                            {item.description || 'No description provided'}
                          </div>
                        </td>

                        <td>
                          <span className="badge badge-info">
                            <Layers size={11} /> {item.categoryName || 'General'}
                          </span>
                        </td>

                        <td>
                          <span className="price">₹{parseFloat(item.price).toFixed(0)}</span>
                        </td>

                        <td>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {item.estimatedMinutes || 15}m
                          </span>
                        </td>

                        <td>
                          <button
                            onClick={() => toggleAvail(item.id)}
                            className={`badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}`}
                            style={{ cursor: 'pointer', border: 'none' }}
                            title="Click to toggle availability"
                          >
                            {item.isAvailable ? (
                              <>
                                <CheckCircle2 size={12} /> In Stock
                              </>
                            ) : (
                              <>
                                <XCircle size={12} /> Out of Stock
                              </>
                            )}
                          </button>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditItem(item)}
                              title="Edit Item"
                              style={{ padding: '6px 9px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => deleteItem(item.id)}
                              title="Delete Item"
                              style={{ padding: '6px 9px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category Title</th>
                  <th>Description</th>
                  <th>Display Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="icon">
                          <FolderPlus size={30} />
                        </div>
                        <h3>No categories yet</h3>
                        <p>Create categories like Appetizers, Main Course, Drinks, etc.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong style={{ color: 'var(--text)', fontSize: '14px' }}>{c.name}</strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.description || '—'}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{c.sortOrder}</span>
                      </td>
                      <td>
                        <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {c.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditCat(c)}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Dish Item Modal ── */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit Dish Item' : 'New Menu Dish'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowItemModal(false)} style={{ padding: '4px 8px' }}>
                <X size={15} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={itemForm.categoryId}
                  onChange={e => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select menu category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dish Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Grilled Ribeye Steak"
                  value={itemForm.name}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description & Ingredients</label>
                <textarea
                  className="form-textarea"
                  placeholder="Brief culinary notes, allergens, side options..."
                  value={itemForm.description}
                  onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    placeholder="450"
                    value={itemForm.price}
                    onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Prep Time (mins)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={itemForm.estimatedMinutes}
                    onChange={e => setItemForm({ ...itemForm, estimatedMinutes: parseInt(e.target.value, 10) || 15 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={itemForm.isAvailable}
                  onChange={e => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="availCheck" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Item is currently in stock & available for ordering
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowItemModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveItem}>
                {editItem ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Modal ── */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editCat ? 'Edit Category' : 'New Menu Category'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCatModal(false)} style={{ padding: '4px 8px' }}>
                <X size={15} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Starters, Main Course, Desserts"
                  value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Optional category summary"
                  value={catForm.description}
                  onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Display Sort Order</label>
                <input
                  className="form-input"
                  type="number"
                  value={catForm.sortOrder}
                  onChange={e => setCatForm({ ...catForm, sortOrder: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCatModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveCat}>
                {editCat ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
