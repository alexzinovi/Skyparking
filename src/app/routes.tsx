import { createBrowserRouter, Outlet } from "react-router";
import { HomePage } from "./pages/HomePage";
import { LanguageLandingPage } from "./pages/LanguageLandingPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { TermsAndConditions } from "./components/TermsAndConditions";
import { PricingPage } from "./pages/PricingPage";
import { ContactPage } from "./pages/ContactPage";
import { ServicesPage } from "./pages/ServicesPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { BookingPage } from "./pages/BookingPage";
import { FAQPage } from "./pages/FAQPage";
import { AboutPage } from "./pages/AboutPage";
import { LanguageProvider } from "./components/LanguageContext";

// Root layout that wraps all routes with LanguageProvider
function RootLayout() {
  return (
    <LanguageProvider>
      <Outlet />
    </LanguageProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/en",
        element: <LanguageLandingPage lang="en" />,
      },
      {
        path: "/el",
        element: <LanguageLandingPage lang="el" />,
      },
      {
        path: "/tr",
        element: <LanguageLandingPage lang="tr" />,
      },
      {
        path: "/sr",
        element: <LanguageLandingPage lang="sr" />,
      },
      {
        path: "/mk",
        element: <LanguageLandingPage lang="mk" />,
      },
      {
        path: "/ro",
        element: <LanguageLandingPage lang="ro" />,
      },
      {
        path: "/reservation-confirmed",
        element: <ConfirmationPage />,
      },
      {
        path: "/terms",
        element: <TermsAndConditions />,
      },
      {
        path: "/pricing",
        element: <PricingPage />,
      },
      {
        path: "/prices",
        element: <PricingPage />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/services",
        element: <ServicesPage />,
      },
      {
        path: "/how-it-works",
        element: <HowItWorksPage />,
      },
      {
        path: "/booking",
        element: <BookingPage />,
      },
      {
        path: "/reservation",
        element: <BookingPage />,
      },
      {
        path: "/faq",
        element: <FAQPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "*",
        element: <HomePage />,
      },
    ],
  },
]);