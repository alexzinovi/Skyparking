import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { ConfirmationPage } from "./pages/ConfirmationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/reservation-confirmed",
    element: <ConfirmationPage />,
  },
]);
