import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-zinc-200 text-sm">
        Loading your vault...
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/profile"
            element={(
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/items"
            element={(
              <ProtectedRoute>
                <Items />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/items/:id"
            element={(
              <ProtectedRoute>
                <ItemDetail />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/cart"
            element={(
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/orders"
            element={(
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/orders/:id"
            element={(
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default App;