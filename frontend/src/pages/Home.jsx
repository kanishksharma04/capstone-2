import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/items', { 
          params: { page: 1, limit: 12, sortBy: 'createdAt', order: 'desc' }
        });
        setItems(res.data.items || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Marquee Section - Directly below navbar */}
      <div className="w-full bg-[#0a1628] border-b border-[#1a3a5c] py-3 sm:py-4">
        <div className="marquee-container">
          <div className="marquee-content">
            <h1 
              className="text-white font-bold whitespace-nowrap px-8"
              style={{ 
                fontFamily: "'Novocaine', sans-serif",
                fontSize: 'clamp(14px, 2.5vw, 36px)',
                lineHeight: '1.2',
              }}
            >
              Flex Genuine . Forget Fakes ! 
            </h1>
            <h1 
              className="text-white font-bold whitespace-nowrap px-8"
              style={{ 
                fontFamily: "'Novocaine', sans-serif",
                fontSize: 'clamp(14px, 2.5vw, 36px)',
                lineHeight: '1.2',
              }}
            >
              Flex Genuine . Forget Fakes ! 
            </h1>
          </div>
        </div>
      </div>

      {/* Hero Section with Background Image */}
      <Link to="/shop" className="block">
        <section className="relative w-full h-[70vh] min-h-[500px] max-h-[90vh] overflow-hidden cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/image.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/1 via-[#1a3a5c]/1 to-[#0a1628]/1"></div>
          </div>
        </section>
      </Link>

      {/* Catalog Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-white mb-2">Featured Collection</h2>
          <p className="text-sm text-zinc-400">
            Browse India-curated hype, filtered your way.
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-zinc-400 text-sm">
            Loading catalog...
          </div>
        ) : error ? (
          <div className="rounded-md border border-[#dc2626] bg-[#dc2626]/10 px-4 py-3 text-xs text-[#f87171]">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-md border border-[#1a3a5c] bg-[#1a3a5c]/20 px-4 py-10 text-center text-sm text-zinc-400">
            No items found. Check back soon for new drops.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const effectivePrice =
                item.price * (1 - (item.discount || 0) / 100);
              return (
                <Link
                  key={item._id}
                  to={`/items/${item._id}`}
                  className="group rounded-xl border border-[#1a3a5c] bg-[#0a1628]/50 p-3 text-left transition hover:-translate-y-1 hover:border-[#dc2626] hover:shadow-[0_18px_60px_rgba(220,38,38,0.2)] backdrop-blur-sm"
                >
                  <div className="aspect-square rounded-lg border border-[#1a3a5c] bg-[#1a3a5c]/30 mb-3 overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-zinc-500">
                        Image coming soon
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
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
                      {item.discount > 0 && (
                        <span className="text-[11px] text-[#f87171]">
                          -{item.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/items"
              className="inline-flex items-center justify-center rounded-md border border-[#dc2626] bg-[#dc2626] px-6 py-2 text-sm font-medium text-white hover:bg-[#ef4444] transition"
            >
              View All Items
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;


