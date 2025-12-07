import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

const categories = ['sneakers', 'streetwear', 'electronics', 'accessories', 'other'];

const SellerDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'sneakers',
    price: '',
    discount: 0,
    description: '',
    images: '',
    tags: '',
    stock: 0,
  });

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/items/seller/my-items', {
        params: { page, limit: 12 },
      });
      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const itemData = {
        ...formData,
        price: Number(formData.price),
        discount: Number(formData.discount),
        stock: Number(formData.stock),
        images: formData.images ? formData.images.split(',').map((url) => url.trim()) : [],
        tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
      };

      if (editingItem) {
        await apiClient.put(`/items/${editingItem._id}`, itemData);
      } else {
        await apiClient.post('/items', itemData);
      }

      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      brand: item.brand || '',
      category: item.category || 'sneakers',
      price: item.price || '',
      discount: item.discount || 0,
      description: item.description || '',
      images: item.images ? item.images.join(', ') : '',
      tags: item.tags ? item.tags.join(', ') : '',
      stock: item.stock || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await apiClient.delete(`/items/${id}`);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: 'sneakers',
      price: '',
      discount: 0,
      description: '',
      images: '',
      tags: '',
      stock: 0,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    resetForm();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Seller Dashboard</h2>
          <p className="text-xs text-zinc-400">
            Manage your products and inventory
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center rounded-md border border-[#dc2626] bg-[#dc2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#ef4444] transition"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-[#dc2626] bg-[#dc2626]/10 px-4 py-3 text-xs text-[#f87171]">
          {error}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-[#1a3a5c] bg-[#0a1628]/50 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingItem ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-[#1a3a5c] bg-[#0a1628]/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full rounded-md border border-[#1a3a5c] bg-[#0a1628]/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-[#1a3a5c] bg-[#0a1628]/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-md border border-[#1a3a5c] bg-[#0a1628]/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full rounded-md border border-[#1a3a5c] bg-[#0a1628]/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full rounded-md border border-[#1a3a5c] bg-[#0a1628]/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea
                required
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-[#1a3a5c] bg-[#0a1628]/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Images (comma-separated URLs)</label>
              <input
                type="text"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                className="w-full rounded-md border border-[#1a3a5c] bg-[#0a1628]/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
                className="w-full rounded-md border border-[#1a3a5c] bg-[#0a1628]/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-md border border-[#dc2626] bg-[#dc2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#ef4444] transition"
              >
                {editingItem ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-[#1a3a5c] bg-[#1a3a5c]/50 px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3a5c] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-zinc-400 text-sm">
          Loading products...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-[#1a3a5c] bg-[#1a3a5c]/20 px-4 py-10 text-center text-sm text-zinc-400">
          No products yet. Add your first product to get started.
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const effectivePrice = item.price * (1 - (item.discount || 0) / 100);
              return (
                <div
                  key={item._id}
                  className="rounded-xl border border-[#1a3a5c] bg-[#0a1628]/50 p-4 backdrop-blur-sm"
                >
                  <div className="aspect-square rounded-lg border border-[#1a3a5c] bg-[#1a3a5c]/30 mb-3 overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-zinc-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#f87171]">
                      {item.brand}
                    </p>
                    <p className="text-sm font-medium text-zinc-100 line-clamp-2">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-white">
                        ₹{effectivePrice.toLocaleString('en-IN')}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-[11px] text-zinc-500 line-through">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Stock: {item.stock} • Category: {item.category}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="flex-1 rounded-md border border-[#1a3a5c] bg-[#1a3a5c]/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a3a5c] transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 rounded-md border border-[#dc2626] bg-[#dc2626]/20 px-3 py-1.5 text-xs font-medium text-[#f87171] hover:bg-[#dc2626]/30 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-[#1a3a5c] bg-[#1a3a5c]/30 px-3 py-1 disabled:opacity-40 hover:bg-[#1a3a5c] transition"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-[#1a3a5c] bg-[#1a3a5c]/30 px-3 py-1 disabled:opacity-40 hover:bg-[#1a3a5c] transition"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SellerDashboard;

