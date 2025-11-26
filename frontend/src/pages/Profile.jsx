import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">Profile</h2>
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-sm font-semibold">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-zinc-400">{user.email}</p>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-3 text-xs text-zinc-400">
          <p>Role • {user.role}</p>
          <p className="mt-1">
            Profile editing and address management can be wired to real data later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;


