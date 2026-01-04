import { HeroSection } from "./components/HeroSection";
import { Features } from "./components/Features";
import { BookingForm } from "./components/BookingForm";
import { ContactForm } from "./components/ContactForm";
import { MapSection } from "./components/MapSection";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { Toaster } from "./components/ui/sonner";
import { useState, useEffect } from "react";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if we're on the admin route
  useEffect(() => {
    const path = window.location.pathname;
    setIsAdmin(path === "/admin" || path.startsWith("/admin/"));

    // Check if already logged in
    const token = localStorage.getItem("admin-token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  // Wrap everything in LanguageProvider
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Toaster />
        {isAdmin ? (
          isLoggedIn ? (
            <AdminDashboard onLogout={handleLogout} />
          ) : (
            <AdminLogin onLogin={handleLogin} />
          )
        ) : (
          <MainSite />
        )}
      </div>
    </LanguageProvider>
  );
}

function MainSite() {
  const { t } = useLanguage();

  return (
    <div>
      <LanguageSwitcher />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <Features />

      {/* Booking Form */}
      <BookingForm />

      {/* Contact/Inquiry Form */}
      <ContactForm />

      {/* Map Section */}
      <MapSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-2">{t("heroTitle")}</h3>
          <p className="text-gray-400 mb-4">
            {t("footerTagline")}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm text-gray-400">
            <span>{t("footerLocation")}</span>
            <span className="hidden sm:inline">•</span>
            <span>📞 +359 888 123 456</span>
            <span className="hidden sm:inline">•</span>
            <span>✉️ info@sofiaairportparking.com</span>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-500">
            {t("footerRights")}
          </div>
        </div>
      </footer>
    </div>
  );
}