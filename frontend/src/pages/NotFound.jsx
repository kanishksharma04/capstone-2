import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-[60vh] items-center justify-center px-4 animate-fade-in">
    <div className="text-center space-y-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
        404
      </p>
      <h1 className="text-2xl md:text-3xl font-semibold text-white">
        This vault door doesn&apos;t exist.
      </h1>
      <p className="text-sm text-zinc-400 max-w-sm mx-auto">
        The page you&apos;re looking for has either moved, dropped, or never existed.
      </p>
      <div className="flex justify-center gap-3 text-sm">
        <Link
          to="/"
          className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 hover:bg-zinc-900 transition"
        >
          Back home
        </Link>
        <Link
          to="/items"
          className="rounded-md border border-rose-600 bg-rose-600 px-4 py-2 text-white hover:bg-rose-500 transition"
        >
          Browse catalog
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;


