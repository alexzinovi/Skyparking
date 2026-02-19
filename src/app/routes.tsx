import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { TermsAndConditions } from "./components/TermsAndConditions";

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
]);