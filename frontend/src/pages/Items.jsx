import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const categories = ['all', 'sneakers', 'streetwear', 'electronics', 'accessories'];

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'createdAt',
    order: 'desc',
    priceMin: '',
    priceMax: '',
  });

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 12,
        sortBy: filters.sortBy,
        order: filters.order,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.priceMin) params.priceMin = filters.priceMin;
      if (filters.priceMax) params.priceMax = filters.priceMax;

      const res = await apiClient.get('/items', { params });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchItems();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Catalog</h2>
          <p className="text-xs text-zinc-400">
            Browse India-curated hype, filtered your way.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name, brand, tags"
            className="w-full md:w-52 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All categories' : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price</option>
          </select>
          <select
            name="order"
            value={filters.order}
            onChange={handleFilterChange}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="desc">High to low</option>
            <option value="asc">Low to high</option>
          </select>
          <input
            type="number"
            name="priceMin"
            value={filters.priceMin}
            onChange={handleFilterChange}
            placeholder="Min ₹"
            className="w-24 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          <input
            type="number"
            name="priceMax"
            value={filters.priceMax}
            onChange={handleFilterChange}
            placeholder="Max ₹"
            className="w-24 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          <button
            type="button"
            onClick={handleApplyFilters}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-100 hover:bg-zinc-800 transition"
          >
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-zinc-400 text-sm">
          Loading catalog...
        </div>
      ) : error ? (
        <div className="rounded-md border border-rose-700 bg-rose-950 px-4 py-3 text-xs text-rose-200">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-10 text-center text-sm text-zinc-400">
          No items found. Try adjusting your filters.
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const effectivePrice =
                item.price * (1 - (item.discount || 0) / 100);
              return (
                <Link
                  key={item._id}
                  to={`/items/${item._id}`}
                  className="group rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-left transition hover:-translate-y-1 hover:border-zinc-500 hover:shadow-[0_18px_60px_rgba(0,0,0,0.9)]"
                >
                  <div className="aspect-square rounded-lg border border-zinc-800 bg-zinc-900 mb-3 overflow-hidden">
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
                    <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
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
                        <span className="text-[11px] text-rose-400">
                          -{item.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
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
                className="rounded-md border border-zinc-800 px-3 py-1 disabled:opacity-40 hover:bg-zinc-900 transition"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-zinc-800 px-3 py-1 disabled:opacity-40 hover:bg-zinc-900 transition"
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

export default Items;


