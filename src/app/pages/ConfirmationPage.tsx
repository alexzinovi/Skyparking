import { useLocation, useNavigate } from "react-router";
import { ReservationConfirmation } from "../components/ReservationConfirmation";
import { useEffect } from "react";

export function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  // If no booking data, redirect to home
  useEffect(() => {
    if (!booking) {
      navigate("/");
    }
  }, [booking, navigate]);

  if (!booking) {
    return null;
  }

  const handleBackToHome = () => {
    navigate("/");
  };

  return <ReservationConfirmation booking={booking} onBackToHome={handleBackToHome} />;
}
