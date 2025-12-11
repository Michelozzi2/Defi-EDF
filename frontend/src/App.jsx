import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reception from './pages/Reception';
import Commande from './pages/Commande';
import Operations from './pages/Operations';
import WorkspaceSelector from './pages/WorkspaceSelector';
import Labo from './pages/Labo';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Wrapper to apply Layout to protected routes
const AppLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <UserProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'magasin', 'bo', 'labo']} />}>
                <Route path="/workspaces" element={<WorkspaceSelector />} />

                {/* Routes with Sidebar Layout */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />

                  <Route element={<ProtectedRoute allowedRoles={['magasin', 'admin']} />}>
                    <Route path="/reception" element={<Reception />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['bo', 'admin']} />}>
                    <Route path="/commande" element={<Commande />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['bo', 'admin', 'magasin']} />}>
                    <Route path="/operations" element={<Operations />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['labo', 'admin']} />}>
                    <Route path="/labo" element={<Labo />} />
                  </Route>
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ToastProvider>
        </UserProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
