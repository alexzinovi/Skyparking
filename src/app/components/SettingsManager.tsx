import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Mail, CheckCircle, XCircle } from "lucide-react";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

export function SettingsManager() {
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/settings`,
        {
          mode: "cors",
          headers: {
            "X-Session-Token": token || "",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmailNotificationsEnabled(data.emailNotificationsEnabled ?? true);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Неуспешно зареждане на настройките");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("skyparking-token");
      console.log("Saving settings with token:", token ? "Token exists" : "No token");
      console.log("Email notifications setting:", emailNotificationsEnabled);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/settings`,
        {
          method: "PUT",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": token || "",
          },
          body: JSON.stringify({
            emailNotificationsEnabled,
          }),
        }
      );

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        toast.success("Настройките са запазени");
      } else {
        toast.error(`Неуспешно запазване: ${responseData.error || responseData.message || "Неизвестна грешка"}`);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Неуспешно запазване на настройките");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">Зареждане на настройки...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Настройки на системата</h2>

        {/* Email Notifications Section */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5" />
              Имейл известия
            </h3>
            <p className="text-sm text-gray-600">
              Управлявай автоматичните имейл известия за нови резервации
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label className="text-base font-medium text-gray-900">
                  Известия за нови резервации
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Изпрати имейл до reservations@skyparking.bg при всяка нова резервация
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Изключи това при тестване, за да не изчерпваш лимита си за имейли
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  emailNotificationsEnabled ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    emailNotificationsEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Status Indicator */}
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                emailNotificationsEnabled
                  ? "bg-green-50 text-green-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {emailNotificationsEnabled ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Известията са включени</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Известията са изключени</span>
                </>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={updateSettings}
              disabled={isSaving}
              className="bg-[#073590] hover:bg-[#052c70] text-white px-8"
            >
              {isSaving ? "Запазване..." : "Запази настройките"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}