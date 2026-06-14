import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";

// Pages
import AuthPage from "./pages/AuthPage";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import SearchPage from "./pages/SearchPage";
import TutorProfile from "./pages/TutorProfile";
import ChatPage from "./pages/ChatPage";
import RequestPage from "./pages/RequestPage";
import MyProfile from "./pages/MyProfile";
import AdminPage from "./pages/AdminPage";

// Components
import Shell from "./components/Shell";
import PageTransition from "./components/PageTransition";

// Route Guard for authenticated users & profile completeness check
function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="loader">Verifying session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Profile setup check: If profile is incomplete, force redirect to /setup wizard
  // An incomplete profile is defined as lacking a university or subjects list
  const hasNoUni = !profile?.university || profile.university.trim() === "";
  const hasNoSubjects = !profile?.subjects || profile.subjects.length === 0;
  
  if ((hasNoUni || hasNoSubjects) && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return children;
}

// Route Guard specifically for Admins
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="loader">Verifying permissions...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Route */}
        <Route
          path="/auth"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <PageTransition>
                <AuthPage />
              </PageTransition>
            )
          }
        />

        {/* Setup Wizard (accessible to logged-in users only, without strict completeness check) */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ProfileSetup />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Protected Application Routes wrapped in Navigation Shell */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Shell>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route
                      path="dashboard"
                      element={
                        <PageTransition>
                          <Dashboard />
                        </PageTransition>
                      }
                    />
                    <Route
                      path="search"
                      element={
                        <PageTransition>
                          <SearchPage />
                        </PageTransition>
                      }
                    />
                    <Route
                      path="tutor/:id"
                      element={
                        <PageTransition>
                          <TutorProfile />
                        </PageTransition>
                      }
                    />
                    <Route
                      path="chat"
                      element={
                        <PageTransition>
                          <ChatPage />
                        </PageTransition>
                      }
                    />
                    <Route
                      path="requests"
                      element={
                        <PageTransition>
                          <RequestPage />
                        </PageTransition>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <PageTransition>
                          <MyProfile />
                        </PageTransition>
                      }
                    />
                    <Route
                      path="admin"
                      element={
                        <AdminRoute>
                          <PageTransition>
                            <AdminPage />
                          </PageTransition>
                        </AdminRoute>
                      }
                    />
                    
                    {/* Fallback internal route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AnimatePresence>
              </Shell>
            </ProtectedRoute>
          }
        />

        {/* Global Fallback Redirect */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
      </Routes>
    </AnimatePresence>
  );
}
