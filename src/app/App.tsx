import { HeroSection } from "@/app/components/HeroSection";
import { Features } from "@/app/components/Features";
import { BookingForm } from "@/app/components/BookingForm";
import { ContactForm } from "@/app/components/ContactForm";
import { MapSection } from "@/app/components/MapSection";
import { LanguageProvider, useLanguage } from "@/app/components/LanguageContext";
import { AdminLogin } from "@/app/components/AdminLogin";
import { AdminDashboard } from "@/app/components/AdminDashboard";
import { OperatorDashboard } from "@/app/components/OperatorDashboard";
import { LoginScreen, User } from "@/app/components/LoginScreen";
import { Header } from "@/app/components/Header";
import { Reviews } from "@/app/components/Reviews";
import { Toaster } from "@/app/components/ui/sonner";
import { useState, useEffect } from "react";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);

  // Check if we're on the admin route
  useEffect(() => {
    const path = window.location.pathname;
    setIsAdmin(path === "/admin" || path.startsWith("/admin/"));

    // Verify existing token
    const verifyToken = async () => {
      const token = localStorage.getItem("skyparking-token");
      if (token && (path === "/admin" || path.startsWith("/admin/"))) {
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
      <MainSiteContent />
    </LanguageProvider>
  );
}

function MainSiteContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Toaster />
      <MainSite t={t} />
    </div>
  );
}

function MainSite({ t }: { t: (key: string) => string }) {
  return (
    <div>
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <Features />

      {/* Booking Form */}
      <BookingForm />

      {/* Reviews */}
      <Reviews />

      {/* Contact/Inquiry Form */}
      <ContactForm />

      {/* Map Section */}
      <MapSection />

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-2 text-2xl font-bold">{t("heroTitle")}</h3>
          <p className="text-gray-300 mb-6">
            {t("footerTagline")}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm text-gray-300">
            <span>{t("footerLocation")}</span>
            <span className="hidden sm:inline">•</span>
            <span>📞 +359 888 123 456</span>
            <span className="hidden sm:inline">•</span>
            <span>✉️ info@sofiaairportparking.com</span>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400">
            {t("footerRights")}
          </div>
        </div>
      </footer>
    </div>
  );
}