import { HeroSection } from "@/app/components/HeroSection";
import { Features } from "@/app/components/Features";
import { BookingForm } from "@/app/components/BookingForm";
import { ContactForm } from "@/app/components/ContactForm";
import { MapSection } from "@/app/components/MapSection";
import { LanguageProvider, useLanguage } from "@/app/components/LanguageContext";
import { AdminLogin } from "@/app/components/AdminLogin";
import { AdminDashboard } from "@/app/components/AdminDashboard";
import { Header } from "@/app/components/Header";
import { Reviews } from "@/app/components/Reviews";
import { Toaster } from "@/app/components/ui/sonner";
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