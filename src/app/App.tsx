import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AdminDashboard } from "./components/AdminDashboard";
import { OperatorDashboard } from "./components/OperatorDashboard";
import { LoginScreen } from "./components/LoginScreen";
import { LanguageProvider } from "./components/LanguageContext";
import { router } from "./routes";

interface User {
  id: string;
  username: string;
  role: string;
}

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);

  // Disable Chrome's automatic translation - we have our own bilingual system
  useEffect(() => {
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
    
    // Add meta tag to prevent translation
    const meta = document.createElement('meta');
    meta.name = 'google';
    meta.content = 'notranslate';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Check if we're on the admin route
  useEffect(() => {
    try {
      const path = window.location.pathname;
      setIsAdmin(path === "/admin-panel-2026" || path.startsWith("/admin-panel-2026/"));

      // Verify existing token
      const verifyToken = async () => {
        const token = localStorage.getItem("skyparking-token");
        if (token && (path === "/admin-panel-2026" || path.startsWith("/admin-panel-2026/"))) {
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/auth/verify`,
              {
                headers: {
                  "Authorization": `Bearer ${publicAnonKey}`,
                  "X-Session-Token": token,
                },
              }
            );

            const data = await response.json();
            if (data.success) {
              setCurrentUser(data.user);
              setPermissions(data.permissions);
              setIsLoggedIn(true);
            } else {
              localStorage.removeItem("skyparking-token");
            }
          } catch (error) {
            console.error("Token verification error:", error);
            localStorage.removeItem("skyparking-token");
          }
        }
        setIsVerifying(false);
      };

      verifyToken();
    } catch (error) {
      console.error("App initialization error:", error);
      setIsVerifying(false);
    }
  }, []);

  const handleLogin = (user: User, token: string, userPermissions: string[]) => {
    localStorage.setItem("skyparking-token", token);
    setCurrentUser(user);
    setPermissions(userPermissions);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("skyparking-token");
    setCurrentUser(null);
    setPermissions([]);
    setIsLoggedIn(false);
  };

  // Render admin without LanguageProvider
  if (isAdmin) {
    if (isVerifying) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Зареждане...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <Toaster />
        {isLoggedIn ? (
          // Show OperatorDashboard for operator role, AdminDashboard for admin/manager
          currentUser?.role === "operator" ? (
            <OperatorDashboard 
              onLogout={handleLogout} 
              currentUser={currentUser!} 
              permissions={permissions} 
            />
          ) : (
            <AdminDashboard 
              onLogout={handleLogout} 
              currentUser={currentUser!} 
              permissions={permissions} 
            />
          )
        ) : (
          <LoginScreen onLogin={handleLogin} />
        )}
      </div>
    );
  }

  // Render main site with LanguageProvider - wrap everything here
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <Toaster />
        <RouterProvider router={router} />
      </div>
    </LanguageProvider>
  );
}