import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { TermsAndConditions } from "./components/TermsAndConditions";
import { PricingPage } from "./pages/PricingPage";
import { ContactPage } from "./pages/ContactPage";
import { ServicesPage } from "./pages/ServicesPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
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
]);