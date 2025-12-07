import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClasses =
  'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#1a3a5c]';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-zinc-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a3a5c] bg-[#0a1628]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#1a3a5c] border border-[#1a3a5c] text-sm font-semibold">
              FV
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold tracking-tight">Flex Vault</span>
              <span className="text-xs text-zinc-400">
                India&apos;s hype marketplace
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/items"
              className={({ isActive }) =>
                `${navLinkClasses} ${isActive ? 'bg-[#1a3a5c] text-white' : 'text-zinc-300'}`
              }
            >
              Shop
            </NavLink>
            {user && (
              <>
                {user.role === 'seller' ? (
                  <NavLink
                    to="/seller/dashboard"
                    className={({ isActive }) =>
                      `${navLinkClasses} ${isActive ? 'bg-[#1a3a5c] text-white' : 'text-zinc-300'}`
                    }
                  >
                    Seller Dashboard
                  </NavLink>
                ) : (
                  <>
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        `${navLinkClasses} ${isActive ? 'bg-[#1a3a5c] text-white' : 'text-zinc-300'}`
                      }
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/orders"
                      className={({ isActive }) =>
                        `${navLinkClasses} ${isActive ? 'bg-[#1a3a5c] text-white' : 'text-zinc-300'}`
                      }
                    >
                      Orders
                    </NavLink>
                    <NavLink
                      to="/cart"
                      className={({ isActive }) =>
                        `${navLinkClasses} ${isActive ? 'bg-[#1a3a5c] text-white' : 'text-zinc-300'}`
                      }
                    >
                      Cart
                    </NavLink>
                  </>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#1a3a5c] px-3 py-1 text-xs text-zinc-200 hover:bg-[#1a3a5c] transition"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1a3a5c] text-[11px] font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span>{user.name}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-[#1a3a5c] bg-[#1a3a5c] px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-[#1a3a5c]/80 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs text-zinc-300 hover:text-white"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="rounded-md border border-[#dc2626] bg-[#dc2626] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#ef4444] transition"
                >
                  Join now
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 pt-[73px]">
        {children}
      </main>
      <footer className="border-t border-[#1a3a5c] bg-[#0a1628]">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-zinc-500 flex justify-between">
          <span>© {new Date().getFullYear()} Flex Vault</span>
          <span>Authenticity. Speed. Curated hype.</span>
        </div>
      </footer>
    </div>
  );
};


