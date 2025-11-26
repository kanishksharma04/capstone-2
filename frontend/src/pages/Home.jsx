import { Link } from 'react-router-dom';

const Home = () => (
  <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
    <section className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
          India&apos;s hype marketplace
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
          Flex without the fake.
        </h1>
        <p className="text-sm md:text-base text-zinc-300 max-w-xl">
          Flex Vault is your curated vault of authentic sneakers, streetwear, and tech –
          verified, India-ready, and delivered fast.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/items"
            className="inline-flex items-center justify-center rounded-md border border-rose-600 bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 transition"
          >
            Shop the drop
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-900 transition"
          >
            Go to dashboard
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs text-zinc-300">
          <div>
            <p className="font-semibold text-white">Authenticity first</p>
            <p className="text-zinc-400">Curated catalogue, no replicas, no surprises.</p>
          </div>
          <div>
            <p className="font-semibold text-white">India-fast delivery</p>
            <p className="text-zinc-400">Pan-India logistics tuned for hype drops.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Built for collectors</p>
            <p className="text-zinc-400">Track orders, flex your vault, stay ahead.</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_0_80px_rgba(0,0,0,0.7)]">
        <div className="aspect-[4/5] rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500 text-xs">
          Product spotlight coming soon
        </div>
      </div>
    </section>
  </div>
);

export default Home;


