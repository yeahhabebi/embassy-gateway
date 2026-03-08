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
import { RefreshCw, Plus, Pencil, Trash2, Search, X, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
import { getSafeErrorMessage } from "@/lib/error-utils";

type VisaApplication = Tables<"visa_applications">;

const Applications = () => {
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState<VisaApplication | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = searchQuery === "" ||
      `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.passport_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [formData, setFormData] = useState({
    application_number: "",
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
        description: getSafeErrorMessage(error, "Failed to load applications"),
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
      application_number: "",
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
      application_number: app.application_number,
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
    // Validate required fields (only mandatory ones)
    const requiredFields = {
      application_number: "Visa Tracking Number",
      first_name: "First Name",
      last_name: "Last Name",
      passport_number: "Passport Number",
      date_of_birth: "Date of Birth",
      status: "Status",
      country: "Country",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key as keyof typeof formData])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in the following required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const applicationData = {
        application_number: formData.application_number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        passport_number: formData.passport_number,
        date_of_birth: formData.date_of_birth,
        country: formData.country,
        status: formData.status as "processing" | "in_progress" | "documents_incomplete" | "pending" | "approved" | "visa_fee_pending" | "visa_fee_paid" | "issue" | "rejected" | "additional_documents_required",
        email: formData.email || null,
        phone: formData.phone || null,
        gender: formData.gender || null,
        nationality: formData.nationality || null,
        passport_issue_date: formData.passport_issue_date || null,
        passport_expiry_date: formData.passport_expiry_date || null,
        passport_issue_country: formData.passport_issue_country || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        visa_type: (formData.visa_type || "tourist") as "tourist" | "business" | "student" | "work" | "transit" | "diplomatic",
        purpose_of_visit: formData.purpose_of_visit || null,
        intended_arrival_date: formData.intended_arrival_date || null,
        duration_of_stay: formData.duration_of_stay ? parseInt(formData.duration_of_stay) : null,
        admin_notes: formData.admin_notes || null,
        notes: null,
      };

      if (!editingApp) {
        // Check for duplicate application number
        const existingByAppNum = applications.find(
          (app) => app.application_number.toLowerCase() === formData.application_number.trim().toLowerCase()
        );
        if (existingByAppNum) {
          const serialNo = applications.indexOf(existingByAppNum) + 1;
          toast({
            title: "Duplicate Record Found",
            description: `Serial No. ${serialNo} — Application tracking number "${existingByAppNum.application_number}" already exists for ${existingByAppNum.first_name} ${existingByAppNum.last_name}. Duplicate applications cannot be created.`,
            variant: "destructive",
          });
          return;
        }

        // Check for duplicate passport number
        const existingByPassport = applications.find(
          (app) => app.passport_number.toLowerCase() === formData.passport_number.trim().toLowerCase()
        );
        if (existingByPassport) {
          const serialNo = applications.indexOf(existingByPassport) + 1;
          toast({
            title: "Duplicate Record Found",
            description: `Serial No. ${serialNo} — Passport number "${existingByPassport.passport_number}" is already on record for ${existingByPassport.first_name} ${existingByPassport.last_name} (${existingByPassport.application_number}). Duplicate applications cannot be created.`,
            variant: "destructive",
          });
          return;
        }
      } else {
        // When editing, check duplicates excluding current record
        const existingByAppNum = applications.find(
          (app) => app.id !== editingApp.id && app.application_number.toLowerCase() === formData.application_number.trim().toLowerCase()
        );
        if (existingByAppNum) {
          const serialNo = applications.indexOf(existingByAppNum) + 1;
          toast({
            title: "Duplicate Record Found",
            description: `Serial No. ${serialNo} — Application tracking number "${existingByAppNum.application_number}" already exists. Cannot use a duplicate tracking number.`,
            variant: "destructive",
          });
          return;
        }

        const existingByPassport = applications.find(
          (app) => app.id !== editingApp.id && app.passport_number.toLowerCase() === formData.passport_number.trim().toLowerCase()
        );
        if (existingByPassport) {
          const serialNo = applications.indexOf(existingByPassport) + 1;
          toast({
            title: "Duplicate Record Found",
            description: `Serial No. ${serialNo} — Passport number "${existingByPassport.passport_number}" is already on record for ${existingByPassport.first_name} ${existingByPassport.last_name}. Cannot use a duplicate passport number.`,
            variant: "destructive",
          });
          return;
        }
      }

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
      // Handle database-level unique constraint violations as fallback
      const errMsg = typeof error?.message === "string" ? error.message : "";
      if (errMsg.includes("idx_visa_applications_application_number_unique") || errMsg.includes("visa_applications_application_number")) {
        toast({
          title: "Duplicate Record",
          description: `This application tracking number already exists in the system. Duplicate applications cannot be created.`,
          variant: "destructive",
        });
      } else if (errMsg.includes("idx_visa_applications_passport_number_unique") || errMsg.includes("visa_applications_passport_number")) {
        toast({
          title: "Duplicate Record",
          description: `This passport number already exists in the system. Duplicate applications cannot be created.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: getSafeErrorMessage(error, "Failed to save application"),
          variant: "destructive",
        });
      }
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
        description: getSafeErrorMessage(error, "Failed to delete application"),
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("visa_applications")
        .update({ status: newStatus as any })
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
        description: getSafeErrorMessage(error, "Failed to update status"),
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      processing: "bg-blue-500",
      in_progress: "bg-yellow-500",
      documents_incomplete: "bg-orange-500",
      additional_documents_required: "bg-indigo-500",
      pending: "bg-amber-500",
      approved: "bg-green-500",
      visa_fee_pending: "bg-purple-500",
      visa_fee_paid: "bg-teal-500",
      issue: "bg-emerald-600",
      rejected: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    return status === 'issue' ? 'Visa Issued' : status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const dataToExport = filteredApplications;

    const statusColorMap: Record<string, [number, number, number]> = {
      processing: [59, 130, 246],
      in_progress: [234, 179, 8],
      documents_incomplete: [249, 115, 22],
      additional_documents_required: [99, 102, 241],
      pending: [245, 158, 11],
      approved: [34, 197, 94],
      visa_fee_pending: [168, 85, 247],
      visa_fee_paid: [20, 184, 166],
      issue: [5, 150, 105],
      rejected: [239, 68, 68],
    };

    const rows = dataToExport.map((app, i) => [
      (i + 1).toString(),
      app.application_number,
      `${app.first_name} ${app.last_name}`,
      app.passport_number,
      app.date_of_birth,
      getStatusLabel(app.status),
    ]);

    const title = `Visa Applications — ${dataToExport.length} Records`;
    const generatedDate = `Generated: ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

    autoTable(doc, {
      head: [["Serial\nNo", "Visa Tracking\nNumber", "Name", "Passport\nNumber", "Date of\nBirth", "Status"]],
      body: rows,
      startY: 22,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak", lineWidth: 0.2 },
      headStyles: { fillColor: [30, 64, 100], textColor: 255, fontStyle: "bold", halign: "left", fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 14, halign: "center" },
        1: { cellWidth: 36 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 26 },
        5: { cellWidth: 32 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 6) {
          const status = dataToExport[data.row.index]?.status;
          const color = statusColorMap[status] || [107, 114, 128];
          data.cell.styles.textColor = color;
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: (data) => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, 14, 12);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(generatedDate, 14, 18);

        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 8, { align: "right" });
      },
      margin: { top: 22, bottom: 14 },
    });

    doc.save(`visa-applications-${new Date().toISOString().split("T")[0]}.pdf`);

    toast({ title: "PDF Downloaded", description: `${dataToExport.length} application records exported.` });
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
          <Button onClick={downloadPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
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
                  {editingApp ? "Update application details below" : "Fill in mandatory fields (*) to create. Other details can be added later."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="application_number">Visa Tracking Number *</Label>
                  <Input
                    id="application_number"
                    value={formData.application_number}
                    onChange={(e) => handleInputChange("application_number", e.target.value)}
                    placeholder="VISA-YYYY-XXXXXX"
                  />
                </div>

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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
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
                    <Label htmlFor="gender">Gender</Label>
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
                    <Label htmlFor="nationality">Nationality</Label>
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
                    <Label htmlFor="passport_issue_country">Issue Country</Label>
                    <Input
                      id="passport_issue_country"
                      value={formData.passport_issue_country}
                      onChange={(e) => handleInputChange("passport_issue_country", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport_issue_date">Passport Issue Date</Label>
                    <Input
                      id="passport_issue_date"
                      type="date"
                      value={formData.passport_issue_date}
                      onChange={(e) => handleInputChange("passport_issue_date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_expiry_date">Passport Expiry Date</Label>
                    <Input
                      id="passport_expiry_date"
                      type="date"
                      value={formData.passport_expiry_date}
                      onChange={(e) => handleInputChange("passport_expiry_date", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
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
                    <Label htmlFor="visa_type">Visa Type</Label>
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
                        <SelectItem value="documents_incomplete">Documents Incomplete</SelectItem>
                        <SelectItem value="additional_documents_required">Additional Documents Required</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="visa_fee_pending">Visa Fee Pending</SelectItem>
                        <SelectItem value="visa_fee_paid">Visa Fee Paid</SelectItem>
                        <SelectItem value="issue">Visa Issued</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose_of_visit">Purpose of Visit</Label>
                  <Textarea
                    id="purpose_of_visit"
                    value={formData.purpose_of_visit}
                    onChange={(e) => handleInputChange("purpose_of_visit", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="intended_arrival_date">Intended Arrival Date</Label>
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
          <CardTitle>All Applications ({filteredApplications.length})</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, passport or tracking number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0" onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="documents_incomplete">Documents Incomplete</SelectItem>
                <SelectItem value="additional_documents_required">Additional Documents Required</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="visa_fee_pending">Visa Fee Pending</SelectItem>
                <SelectItem value="visa_fee_paid">Visa Fee Paid</SelectItem>
                <SelectItem value="issue">Visa Issued</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial No</TableHead>
                <TableHead>Visa Tracking Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Passport Number</TableHead>
                <TableHead>Date of Birth</TableHead>
                
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : filteredApplications.map((app, index) => (
                <TableRow key={app.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {app.application_number}
                  </TableCell>
                  <TableCell>
                    {app.first_name} {app.last_name}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{app.passport_number}</TableCell>
                  <TableCell>{app.date_of_birth}</TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(value) => updateStatus(app.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status === 'issue' ? 'Visa Issued' : app.status.replace(/_/g, ' ')}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="documents_incomplete">Documents Incomplete</SelectItem>
                        <SelectItem value="additional_documents_required">Additional Documents Required</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="visa_fee_pending">Visa Fee Pending</SelectItem>
                        <SelectItem value="visa_fee_paid">Visa Fee Paid</SelectItem>
                        <SelectItem value="issue">Visa Issued</SelectItem>
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
