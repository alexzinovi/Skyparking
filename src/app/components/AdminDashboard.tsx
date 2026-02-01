import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  LogOut, 
  Calendar,
  Car,
  User,
  Mail,
  Phone,
  Euro,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

interface Booking {
  id: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  name: string;
  email: string;
  phone: string;
  numberOfCars?: number;
  licensePlate: string;
  licensePlate2?: string;
  licensePlate3?: string;
  licensePlate4?: string;
  licensePlate5?: string;
  passengers: number;
  totalPrice: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt?: string;
  needsInvoice?: boolean;
  companyName?: string;
  companyOwner?: string;
  taxNumber?: string;
  isVAT?: boolean;
  vatNumber?: string;
  city?: string;
  address?: string;
}

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<Booking>>({});

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
        setFilteredBookings(data.bookings);
      } else {
        toast.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredBookings(bookings);
      return;
    }

    const filtered = bookings.filter(booking =>
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm)
    );
    setFilteredBookings(filtered);
  }, [searchTerm, bookings]);

  // Delete booking
  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Booking deleted successfully");
        fetchBookings();
      } else {
        toast.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete booking");
    }
  };

  // Save booking (create or update)
  const saveBooking = async () => {
    try {
      const url = editingBooking
        ? `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${editingBooking.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings`;

      const method = editingBooking ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingBooking ? "Booking updated" : "Booking created");
        setEditingBooking(null);
        setIsAddingNew(false);
        setFormData({});
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to save booking");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save booking");
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "unpaid":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Unpaid</Badge>;
      case "pending":
        return <Badge className="bg-orange-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "manual":
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Manual</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">SkyParking Admin Dashboard</h1>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, license plate, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => { setIsAddingNew(true); setFormData({ paymentStatus: "manual" }); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Manual Booking
          </Button>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="text-center py-12">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? "No bookings found matching your search" : "No bookings yet"}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <User className="h-4 w-4 mr-1" />
                        Customer
                      </div>
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-sm text-gray-600">{booking.email}</div>
                      <div className="text-sm text-gray-600">{booking.phone}</div>
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Dates
                      </div>
                      <div className="text-sm">
                        <div><strong>Arrival:</strong> {booking.arrivalDate} {booking.arrivalTime}</div>
                        <div><strong>Departure:</strong> {booking.departureDate} {booking.departureTime}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Car className="h-4 w-4 mr-1" />
                        Vehicle{booking.numberOfCars && booking.numberOfCars > 1 ? 's' : ''}
                      </div>
                      <div className="font-medium">{booking.licensePlate}</div>
                      {booking.licensePlate2 && <div className="text-sm text-gray-600">{booking.licensePlate2}</div>}
                      {booking.licensePlate3 && <div className="text-sm text-gray-600">{booking.licensePlate3}</div>}
                      {booking.licensePlate4 && <div className="text-sm text-gray-600">{booking.licensePlate4}</div>}
                      {booking.licensePlate5 && <div className="text-sm text-gray-600">{booking.licensePlate5}</div>}
                      <div className="text-sm text-gray-600 mt-1">{booking.passengers} passenger(s)</div>
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Euro className="h-4 w-4 mr-1" />
                        Payment
                      </div>
                      <div className="font-bold text-lg">€{booking.totalPrice}</div>
                      <div>{getPaymentStatusBadge(booking.paymentStatus)}</div>
                      {booking.needsInvoice && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            <FileText className="h-3 w-3 mr-1" />
                            Invoice Requested
                          </Badge>
                        </div>
                      )}
                    </div>

                    {booking.needsInvoice && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                          <div className="flex items-center text-sm font-semibold text-blue-900 mb-2">
                            <FileText className="h-4 w-4 mr-1" />
                            Invoice Details
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {booking.companyName && (
                              <div>
                                <span className="text-gray-600">Company:</span>
                                <div className="font-medium">{booking.companyName}</div>
                              </div>
                            )}
                            {booking.companyOwner && (
                              <div>
                                <span className="text-gray-600">Owner:</span>
                                <div className="font-medium">{booking.companyOwner}</div>
                              </div>
                            )}
                            {booking.taxNumber && (
                              <div>
                                <span className="text-gray-600">Tax Number:</span>
                                <div className="font-medium">{booking.taxNumber}</div>
                              </div>
                            )}
                            {booking.isVAT && booking.vatNumber && (
                              <div>
                                <span className="text-gray-600">VAT Number:</span>
                                <div className="font-medium text-green-700">{booking.vatNumber}</div>
                              </div>
                            )}
                            {booking.city && (
                              <div>
                                <span className="text-gray-600">City:</span>
                                <div className="font-medium">{booking.city}</div>
                              </div>
                            )}
                            {booking.address && (
                              <div className="md:col-span-2">
                                <span className="text-gray-600">Address:</span>
                                <div className="font-medium">{booking.address}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-400">
                        Created: {new Date(booking.createdAt).toLocaleString()}
                      </div>
                      {booking.updatedAt && (
                        <div className="text-xs text-gray-400">
                          Updated: {new Date(booking.updatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBooking(booking);
                        setFormData(booking);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteBooking(booking.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={editingBooking !== null || isAddingNew} onOpenChange={(open) => {
        if (!open) {
          setEditingBooking(null);
          setIsAddingNew(false);
          setFormData({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBooking ? "Edit Booking" : "Add Manual Booking"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate || ""}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalDate">Arrival Date</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate || ""}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input
                  id="arrivalTime"
                  type="time"
                  value={formData.arrivalTime || ""}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate || ""}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={formData.departureTime || ""}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="passengers">Passengers</Label>
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  value={formData.passengers || 1}
                  onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="totalPrice">Total Price (€)</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  min="0"
                  value={formData.totalPrice || 0}
                  onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <select
                  id="paymentStatus"
                  className="w-full h-10 px-3 border rounded-md"
                  value={formData.paymentStatus || "unpaid"}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                >
                  <option value="unpaid">Unpaid (Pay on Arrival)</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="manual">Manual/Cash</option>
                </select>
              </div>
            </div>

            {/* Invoice Section */}
            <div className="border-t pt-4">
              <div className="mb-4">
                <Label>Needs Invoice?</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.needsInvoice === true}
                      onChange={() => setFormData({ ...formData, needsInvoice: true })}
                      className="w-4 h-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.needsInvoice === false || formData.needsInvoice === undefined}
                      onChange={() => setFormData({ ...formData, needsInvoice: false })}
                      className="w-4 h-4"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {formData.needsInvoice && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Invoice Details
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName || ""}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyOwner">Company Owner</Label>
                      <Input
                        id="companyOwner"
                        value={formData.companyOwner || ""}
                        onChange={(e) => setFormData({ ...formData, companyOwner: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taxNumber">Tax Number</Label>
                      <Input
                        id="taxNumber"
                        value={formData.taxNumber || ""}
                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isVAT || false}
                        onChange={(e) => setFormData({ ...formData, isVAT: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">VAT Registered</span>
                    </label>

                    {formData.isVAT && (
                      <div>
                        <Label htmlFor="vatNumber">VAT Number</Label>
                        <Input
                          id="vatNumber"
                          value={formData.vatNumber || ""}
                          onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                          placeholder="e.g., BG123456789"
                          className="bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingBooking(null);
              setIsAddingNew(false);
              setFormData({});
            }}>
              Cancel
            </Button>
            <Button onClick={saveBooking}>
              {editingBooking ? "Update" : "Create"} Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}