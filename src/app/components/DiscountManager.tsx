import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Percent, Euro, Plus, Trash2, Edit, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

interface DiscountCode {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  usageCount: number;
  maxUsages?: number;
  expiryDate?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export function DiscountManager() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);

  // Form states for creating new discount
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percentage" | "fixed">("percentage");
  const [newValue, setNewValue] = useState("");
  const [newMaxUsages, setNewMaxUsages] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");

  // Load all discount codes
  const loadDiscounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/discounts`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setDiscounts(data.discounts);
      }
    } catch (error) {
      console.error("Failed to load discounts:", error);
      toast.error("Failed to load discount codes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  // Create new discount code
  const handleCreateDiscount = async () => {
    if (!newCode || !newValue) {
      toast.error("Please fill in code and discount value");
      return;
    }

    const value = parseFloat(newValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Discount value must be a positive number");
      return;
    }

    if (newType === "percentage" && value > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    setIsCreating(true);

    try {
      const discountData = {
        code: newCode.trim(),
        discountType: newType,
        discountValue: value,
        maxUsages: newMaxUsages ? parseInt(newMaxUsages) : null,
        expiryDate: newExpiryDate || null,
        isActive: true,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/discounts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(discountData),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Discount code created successfully");
        setNewCode("");
        setNewValue("");
        setNewMaxUsages("");
        setNewExpiryDate("");
        loadDiscounts();
      } else {
        toast.error(result.message || "Failed to create discount code");
      }
    } catch (error) {
      console.error("Create discount error:", error);
      toast.error("Failed to create discount code");
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle discount active status
  const handleToggleActive = async (code: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/discounts/${code}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`Discount code ${!currentStatus ? "activated" : "deactivated"}`);
        loadDiscounts();
      } else {
        toast.error("Failed to update discount code");
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("Failed to update discount code");
    }
  };

  // Delete discount code
  const handleDeleteDiscount = async (code: string) => {
    if (!confirm(`Are you sure you want to delete discount code "${code}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/discounts/${code}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Discount code deleted");
        loadDiscounts();
      } else {
        toast.error("Failed to delete discount code");
      }
    } catch (error) {
      console.error("Delete discount error:", error);
      toast.error("Failed to delete discount code");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#073590]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Discount Card */}
      <Card className="p-6 bg-white shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Discount Code
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newCode">Discount Code *</Label>
            <Input
              id="newCode"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="SUMMER2026"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newType">Discount Type *</Label>
            <select
              id="newType"
              value={newType}
              onChange={(e) => setNewType(e.target.value as "percentage" | "fixed")}
              className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#073590]"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (€)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newValue">Discount Value *</Label>
            <div className="relative">
              <Input
                id="newValue"
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={newType === "percentage" ? "10" : "5"}
                className="h-11 pr-10"
                min="0"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {newType === "percentage" ? <Percent className="h-4 w-4" /> : <Euro className="h-4 w-4" />}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newMaxUsages">Max Uses (Optional)</Label>
            <Input
              id="newMaxUsages"
              type="number"
              value={newMaxUsages}
              onChange={(e) => setNewMaxUsages(e.target.value)}
              placeholder="Unlimited"
              className="h-11"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newExpiryDate">Expiry Date (Optional)</Label>
            <Input
              id="newExpiryDate"
              type="date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              className="h-11"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleCreateDiscount}
            disabled={isCreating}
            className="bg-[#073590] hover:bg-[#052c70] text-white font-medium h-11"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Discount Code
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Existing Discount Codes */}
      <Card className="p-6 bg-white shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Active Discount Codes</h3>

        {discounts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No discount codes created yet</p>
        ) : (
          <div className="space-y-4">
            {discounts.map((discount) => (
              <div
                key={discount.code}
                className={`border rounded-lg p-4 ${
                  discount.isActive ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{discount.code}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          discount.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {discount.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Discount</p>
                        <p className="font-semibold text-gray-900">
                          {discount.discountType === "percentage"
                            ? `${discount.discountValue}%`
                            : `€${discount.discountValue}`}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Uses</p>
                        <p className="font-semibold text-gray-900">
                          {discount.usageCount}
                          {discount.maxUsages ? ` / ${discount.maxUsages}` : " / ∞"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-semibold text-gray-900">{formatDate(discount.createdAt)}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Expires</p>
                        <p className="font-semibold text-gray-900">
                          {discount.expiryDate ? formatDate(discount.expiryDate) : "Never"}
                        </p>
                      </div>
                    </div>

                    {discount.lastUsedAt && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-500">
                          Last used: <span className="text-gray-900">{formatDate(discount.lastUsedAt)}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(discount.code, discount.isActive)}
                      className={`${
                        discount.isActive
                          ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                          : "border-green-300 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {discount.isActive ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteDiscount(discount.code)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
