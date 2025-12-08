import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
        Loading order...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-md border border-rose-700 bg-rose-950 px-4 py-3 text-xs text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Order details</h2>
          <p className="text-xs text-zinc-400">
            #{order.id.slice(-10)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-[11px] capitalize text-zinc-200">
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
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200 space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            Placed{' '}
            {new Date(order.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
          <span>
            Total • ₹{order.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="border-t border-zinc-800 pt-3 space-y-3">
          {order.items.map((item) => (
            <div
              key={item.itemId}
              className="flex items-center justify-between text-xs text-zinc-300"
            >
              <div>
                <p className="font-medium text-zinc-100">
                  {item.nameSnapshot}
                </p>
                <p className="text-zinc-500">
                  Qty • {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p>₹{item.priceSnapshot.toLocaleString('en-IN')}</p>
                <p className="text-zinc-500">
                  Subtotal • ₹
                  {(item.priceSnapshot * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

