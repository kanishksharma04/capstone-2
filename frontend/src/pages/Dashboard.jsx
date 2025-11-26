import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Hey {user?.name || 'there'}, welcome to your vault.
          </h2>
          <p className="text-xs text-zinc-400">
            Track your hype journey across orders, drops, and your profile.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Orders
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            Your recent drops
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            View your latest Flex Vault orders and statuses.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Cart
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            Ready to flex
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Items waiting in your cart, primed for checkout.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Profile
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            Your collector identity
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Keep your details updated for faster delivery.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;