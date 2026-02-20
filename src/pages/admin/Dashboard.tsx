import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, FileWarning, CreditCard, BadgeCheck, AlertCircle, FilePlus } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    in_progress: 0,
    documents_incomplete: 0,
    additional_documents_required: 0,
    pending: 0,
    approved: 0,
    visa_fee_pending: 0,
    visa_fee_paid: 0,
    issue: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: applications } = await supabase
      .from("visa_applications")
      .select("status");

    if (applications) {
      setStats({
        total: applications.length,
        processing: applications.filter((a) => a.status === "processing").length,
        in_progress: applications.filter((a) => a.status === "in_progress").length,
        documents_incomplete: applications.filter((a) => a.status === "documents_incomplete").length,
        additional_documents_required: applications.filter((a) => a.status === "additional_documents_required").length,
        pending: applications.filter((a) => a.status === "pending").length,
        approved: applications.filter((a) => a.status === "approved").length,
        visa_fee_pending: applications.filter((a) => a.status === "visa_fee_pending").length,
        visa_fee_paid: applications.filter((a) => a.status === "visa_fee_paid").length,
        issue: applications.filter((a) => a.status === "issue").length,
        rejected: applications.filter((a) => a.status === "rejected").length,
      });
    }
  };

  const statCards = [
    { title: "Total Applications", value: stats.total, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { title: "Processing", value: stats.processing, icon: Clock, color: "text-blue-600", bg: "bg-blue-600/10" },
    { title: "In Progress", value: stats.in_progress, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-600/10" },
    { title: "Documents Incomplete", value: stats.documents_incomplete, icon: FileWarning, color: "text-orange-600", bg: "bg-orange-600/10" },
    { title: "Additional Docs Required", value: stats.additional_documents_required, icon: FilePlus, color: "text-indigo-600", bg: "bg-indigo-600/10" },
    { title: "Pending", value: stats.pending, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-600/10" },
    { title: "Approved", value: stats.approved, icon: CheckCircle, color: "text-green-600", bg: "bg-green-600/10" },
    { title: "Visa Fee Pending", value: stats.visa_fee_pending, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-600/10" },
    { title: "Visa Fee Paid", value: stats.visa_fee_paid, icon: BadgeCheck, color: "text-teal-600", bg: "bg-teal-600/10" },
    { title: "Issue", value: stats.issue, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-600/10" },
    { title: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-600/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of visa application statistics
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
