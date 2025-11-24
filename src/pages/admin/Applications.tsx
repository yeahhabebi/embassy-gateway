import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/integrations/supabase/types";

type VisaApplication = Tables<"visa_applications">;

const Applications = () => {
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState<VisaApplication | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    passport_number: "",
    passport_issue_date: "",
    passport_expiry_date: "",
    passport_issue_country: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    visa_type: "tourist",
    purpose_of_visit: "",
    intended_arrival_date: "",
    duration_of_stay: "",
    status: "processing",
    admin_notes: "",
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visa_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      nationality: "",
      passport_number: "",
      passport_issue_date: "",
      passport_expiry_date: "",
      passport_issue_country: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
      visa_type: "tourist",
      purpose_of_visit: "",
      intended_arrival_date: "",
      duration_of_stay: "",
      status: "processing",
      admin_notes: "",
    });
    setEditingApp(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (app: VisaApplication) => {
    setEditingApp(app);
    setFormData({
      first_name: app.first_name,
      last_name: app.last_name,
      email: app.email,
      phone: app.phone,
      date_of_birth: app.date_of_birth,
      gender: app.gender,
      nationality: app.nationality,
      passport_number: app.passport_number,
      passport_issue_date: app.passport_issue_date,
      passport_expiry_date: app.passport_expiry_date,
      passport_issue_country: app.passport_issue_country,
      address: app.address,
      city: app.city,
      country: app.country,
      postal_code: app.postal_code || "",
      visa_type: app.visa_type,
      purpose_of_visit: app.purpose_of_visit,
      intended_arrival_date: app.intended_arrival_date,
      duration_of_stay: app.duration_of_stay?.toString() || "",
      status: app.status,
      admin_notes: app.admin_notes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const applicationData = {
        ...formData,
        duration_of_stay: formData.duration_of_stay ? parseInt(formData.duration_of_stay) : null,
        postal_code: formData.postal_code || null,
        application_number: editingApp?.application_number || "",
        visa_type: formData.visa_type as "tourist" | "business" | "student" | "work" | "transit" | "diplomatic",
        status: formData.status as "processing" | "in_progress" | "approved" | "rejected",
      };

      if (editingApp) {
        const { error } = await supabase
          .from("visa_applications")
          .update(applicationData)
          .eq("id", editingApp.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Application updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("visa_applications")
          .insert([applicationData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Application created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      loadApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save application",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("visa_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application deleted successfully",
      });

      setDeletingId(null);
      loadApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete application",
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (id: string, newStatus: "processing" | "in_progress" | "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("visa_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      loadApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      processing: "bg-blue-500",
      in_progress: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Visa Applications</h1>
        <div className="flex gap-2">
          <Button onClick={loadApplications} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingApp ? "Edit Application" : "Create New Application"}</DialogTitle>
                <DialogDescription>
                  {editingApp ? "Update application details below" : "Fill in the application details below"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange("nationality", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number *</Label>
                    <Input
                      id="passport_number"
                      value={formData.passport_number}
                      onChange={(e) => handleInputChange("passport_number", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_issue_country">Issue Country *</Label>
                    <Input
                      id="passport_issue_country"
                      value={formData.passport_issue_country}
                      onChange={(e) => handleInputChange("passport_issue_country", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport_issue_date">Passport Issue Date *</Label>
                    <Input
                      id="passport_issue_date"
                      type="date"
                      value={formData.passport_issue_date}
                      onChange={(e) => handleInputChange("passport_issue_date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_expiry_date">Passport Expiry Date *</Label>
                    <Input
                      id="passport_expiry_date"
                      type="date"
                      value={formData.passport_expiry_date}
                      onChange={(e) => handleInputChange("passport_expiry_date", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visa_type">Visa Type *</Label>
                    <Select value={formData.visa_type} onValueChange={(value) => handleInputChange("visa_type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tourist">Tourist</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="transit">Transit</SelectItem>
                        <SelectItem value="diplomatic">Diplomatic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose_of_visit">Purpose of Visit *</Label>
                  <Textarea
                    id="purpose_of_visit"
                    value={formData.purpose_of_visit}
                    onChange={(e) => handleInputChange("purpose_of_visit", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="intended_arrival_date">Intended Arrival Date *</Label>
                    <Input
                      id="intended_arrival_date"
                      type="date"
                      value={formData.intended_arrival_date}
                      onChange={(e) => handleInputChange("intended_arrival_date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_of_stay">Duration of Stay (days)</Label>
                    <Input
                      id="duration_of_stay"
                      type="number"
                      value={formData.duration_of_stay}
                      onChange={(e) => handleInputChange("duration_of_stay", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    value={formData.admin_notes}
                    onChange={(e) => handleInputChange("admin_notes", e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingApp ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visa Tracking Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Visa Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-sm">
                    {app.application_number}
                  </TableCell>
                  <TableCell>
                    {app.first_name} {app.last_name}
                  </TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.nationality}</TableCell>
                  <TableCell className="capitalize">{app.visa_type}</TableCell>
                  <TableCell>
                    {new Date(app.submission_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(value) => updateStatus(app.id, value as "processing" | "in_progress" | "approved" | "rejected")}
                    >
                      <SelectTrigger className="w-[140px]">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(app)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingId(app.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the visa application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Applications;
