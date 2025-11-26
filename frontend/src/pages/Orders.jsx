import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Orders</h2>
        <p className="text-xs text-zinc-400">Your Flex Vault history.</p>
      </div>
      {error && (
        <div className="rounded-md border border-rose-700 bg-rose-950 px-4 py-3 text-xs text-rose-200">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-10 text-center text-sm text-zinc-400">
          No orders yet. Your vault is waiting.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm hover:border-zinc-500 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-500">
                    Order •{' '}
                    <span className="font-mono text-[11px]">
                      #{order._id.slice(-8)}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950 px-2 py-0.5 capitalize">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      order.status === 'delivered'
                        ? 'bg-emerald-400'
                        : order.status === 'shipped'
                        ? 'bg-sky-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  {order.status}
                </span>
                <span>Tap for full breakdown</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;


