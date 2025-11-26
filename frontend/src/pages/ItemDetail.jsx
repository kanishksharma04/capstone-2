import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const ItemDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    setFeedback('');
    try {
      await apiClient.post('/cart', { itemId: id, quantity: 1 });
      setFeedback('Added to cart');
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
      setTimeout(() => setFeedback(''), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-zinc-400">
        Loading item...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-md border border-rose-700 bg-rose-950 px-4 py-3 text-xs text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  if (!item) return null;

  const effectivePrice = item.price * (1 - (item.discount || 0) / 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            {item.images?.[0] ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                Product imagery coming soon
              </div>
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="flex gap-2">
              {item.images.slice(1, 5).map((img) => (
                <div
                  key={img}
                  className="h-14 w-14 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden"
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            {item.brand} • {item.category}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {item.name}
          </h1>
          <p className="text-sm text-zinc-300">{item.description}</p>
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-white">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {item.discount > 0 && (
                <>
                  <span className="text-sm text-zinc-500 line-through">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-rose-400 font-medium">
                    -{item.discount}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {item.stock > 0
                ? `${item.stock} in stock • ships fast within India`
                : 'Out of stock'}
            </p>
          </div>
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[11px] text-zinc-300">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-700 bg-zinc-950 px-2 py-0.5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || item.stock <= 0}
              className="inline-flex items-center justify-center rounded-md border border-rose-600 bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {item.stock <= 0 ? 'Out of stock' : adding ? 'Adding...' : 'Add to cart'}
            </button>
            {feedback && (
              <p className="mt-2 text-xs text-zinc-300">{feedback}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;


