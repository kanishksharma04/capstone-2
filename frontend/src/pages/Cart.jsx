import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/cart');
      setItems(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await apiClient.put(`/cart/${id}`, { quantity });
      loadCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update quantity');
    }
  };

  const removeItem = async (id) => {
    try {
      await apiClient.delete(`/cart/${id}`);
      loadCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!showAddressForm) {
      setShowAddressForm(true);
      return;
    }

    if (!address.street || !address.city || !address.state || !address.zipCode) {
      setError('Please fill in all address fields');
      return;
    }

    setCheckingOut(true);
    setError('');
    try {
      const res = await apiClient.post('/cart/checkout', { address });
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const total = items.reduce((sum, { item, quantity }) => {
    const price = item.price * (1 - (item.discount || 0) / 100);
    return sum + price * quantity;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Cart</h2>
        <p className="text-xs text-zinc-400">
          Review your vault before checking out.
        </p>
      </div>
      {error && (
        <div className="rounded-md border border-rose-700 bg-rose-950 px-4 py-3 text-xs text-rose-200">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
          Loading cart...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-10 text-center text-sm text-zinc-400">
          Your Flex Vault is empty. Start adding hype.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)]">
          <div className="space-y-3">
            {items.map(({ id, item, quantity }) => {
              const price = item.price * (1 - (item.discount || 0) / 100);
              const subtotal = price * quantity;
              return (
                <div
                  key={id}
                  className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                >
                  <div className="h-20 w-20 flex-shrink-0 rounded-md border border-zinc-800 bg-zinc-900 overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {item.brand}
                        </p>
                        <p className="text-sm font-medium text-zinc-100 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Qty • {quantity}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-white">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          ₹{price.toLocaleString('en-IN')} each
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                      <div className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-950">
                        <button
                          type="button"
                          onClick={() => updateQuantity(id, quantity - 1)}
                          className="h-7 w-7 border-r border-zinc-800 text-xs hover:bg-zinc-900"
                        >
                          −
                        </button>
                        <span className="px-3">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(id, quantity + 1)}
                          className="h-7 w-7 border-l border-zinc-800 text-xs hover:bg-zinc-900"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(id)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="text-sm font-semibold text-white">Order summary</h3>
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Delivery</span>
              <span>Included</span>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex items-center justify-between text-sm font-semibold text-white">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            {showAddressForm && (
              <div className="border-t border-zinc-800 pt-3 space-y-2">
                <h4 className="text-xs font-semibold text-white">Delivery Address</h4>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={!items.length || checkingOut}
              onClick={handleCheckout}
              className="mt-3 w-full rounded-md border border-[#dc2626] bg-[#dc2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#ef4444] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingOut ? 'Processing...' : showAddressForm ? 'Place Order' : 'Proceed to Checkout'}
            </button>
            <p className="text-[11px] text-zinc-500">
              Flex Vault simulates checkout for demo—no real payments yet.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;


