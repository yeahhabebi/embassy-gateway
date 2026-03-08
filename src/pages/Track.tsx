import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, Calendar, User } from "lucide-react";
import SEOHead, { breadcrumbSchema } from "@/components/SEOHead";
import { useCMSContent } from "@/hooks/useCMSContent";

type VisaApplication = {
  id: string;
  application_number: string;
  first_name: string;
  last_name: string;
  email: string;
  nationality: string;
  visa_type: string;
  status: string;
  submission_date: string;
  intended_arrival_date: string;
  passport_number: string;
  date_of_birth: string;
};

const Track = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passportNumber, setPassportNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [application, setApplication] = useState<VisaApplication | null>(null);

  const { get } = useCMSContent([
    "track_hero_title",
    "track_hero_subtitle",
    "track_form_title",
    "track_form_description",
    "track_button_text",
    "track_help_email",
    "track_help_phone",
    "track_help_hours",
  ]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passportNumber || !dateOfBirth) {
      toast({
        title: "Missing Information",
        description: "Please enter both passport number and date of birth",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('track-application', {
        body: {
          passport_number: passportNumber.trim(),
          date_of_birth: dateOfBirth,
        },
      });

      if (error) throw error;

      if (data.error || !data.application) {
        toast({
          title: "Application Not Found",
          description: data.error || "No application found with the provided details. Please check your passport number and date of birth.",
          variant: "destructive",
        });
        setApplication(null);
      } else {
        setApplication(data.application);
        toast({
          title: "Application Found",
          description: "Your visa application details are displayed below.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to search for application",
        variant: "destructive",
      });
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "processing": return "bg-blue-500";
      case "in_progress": return "bg-blue-600";
      case "pending": return "bg-yellow-500";
      case "documents_incomplete": return "bg-orange-500";
      case "additional_documents_required": return "bg-orange-600";
      case "visa_fee_pending": return "bg-amber-500";
      case "visa_fee_paid": return "bg-teal-500";
      case "issue": return "bg-emerald-600";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      processing: "Processing",
      in_progress: "In Progress",
      approved: "Approved",
      rejected: "Rejected",
      documents_incomplete: "Documents Incomplete",
      additional_documents_required: "Additional Documents Required",
      pending: "Pending",
      visa_fee_pending: "Visa Fee Pending",
      visa_fee_paid: "Visa Fee Paid",
      issue: "Visa Issued",
    };
    return labels[status] || status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "processing":
        return { text: "Your application is currently being processed. Please allow some time for our team to review your submission.", color: "text-blue-600 dark:text-blue-400" };
      case "in_progress":
        return { text: "Your application is in progress. Our team is actively working on your visa request.", color: "text-blue-600 dark:text-blue-400" };
      case "pending":
        return { text: "Your application is pending review. We will notify you once it is being processed.", color: "text-yellow-600 dark:text-yellow-400" };
      case "documents_incomplete":
        return { text: "Your submitted documents are incomplete. Please submit the missing documents to proceed with your application.", color: "text-orange-600 dark:text-orange-400" };
      case "additional_documents_required":
        return { text: "Additional documents are required for your application. Please check your email for details on what documents to submit.", color: "text-orange-600 dark:text-orange-400" };
      case "visa_fee_pending":
        return { text: "Your visa fee payment is pending. Please complete the payment to continue processing your application.", color: "text-amber-600 dark:text-amber-400" };
      case "visa_fee_paid":
        return { text: "Your visa fee has been received. Your application is now being processed for final review.", color: "text-teal-600 dark:text-teal-400" };
      case "approved":
        return { text: "Congratulations! Your visa application has been approved. You will receive further instructions via email.", color: "text-green-600 dark:text-green-400 font-medium" };
      case "issue":
        return { text: "Congratulations! Your visa has been issued. Please check your email for collection or delivery instructions.", color: "text-emerald-600 dark:text-emerald-400 font-medium" };
      case "rejected":
        return { text: "Unfortunately, your visa application has been rejected. Please contact our embassy for more information or to discuss reapplication options.", color: "text-red-600 dark:text-red-400" };
      default:
        return { text: "Your application status is being updated. Please check back later.", color: "text-muted-foreground" };
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Track Your Visa Application"
        description="Track your Bosnia and Herzegovina visa application status online. Enter your passport number and date of birth to check the current status of your application."
        canonical="/track"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Track Application", url: "/track" },
        ])}
      />
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="h-16 w-16 mx-auto mb-6" />
            <h1 className="mb-6">{get("track_hero_title", "Track Your Application")}</h1>
            <p className="text-xl text-primary-foreground/90">
              {get("track_hero_subtitle", "Check the status of your visa application")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Search Form */}
            <Card className="mb-8 border-0 shadow-lg">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <Search className="h-7 w-7 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  {get("track_form_title", "Application Tracking")}
                </CardTitle>
                <CardDescription className="text-center mt-2">
                  {get("track_form_description", "Enter your passport number and date of birth to check the current status.")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="passport_number" className="font-semibold">Passport Number</Label>
                    <Input
                      id="passport_number"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="Enter your passport number"
                      className="rounded-xl h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob" className="font-semibold">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="rounded-xl h-12"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-400 hover:bg-amber-500 text-foreground font-bold text-base py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      "Searching..."
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        {get("track_button_text", "Track Application")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Application Details */}
            {application && (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Application Details</CardTitle>
                      <CardDescription className="mt-2">
                        Visa Tracking Number: <span className="font-semibold text-foreground">{application.application_number}</span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusLabel(application.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Personal Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{application.first_name} {application.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Passport Number</p>
                        <p className="font-medium">{application.passport_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{new Date(application.date_of_birth).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Application Timeline</span>
                    </div>
                    <div className="pl-6">
                      <div className="relative pl-6">
                        <div className={`absolute w-3 h-3 ${getStatusColor(application.status)} rounded-full -left-[7px] top-1`}></div>
                        <p className="text-sm text-muted-foreground">Current Status</p>
                        <p className="font-medium">{getStatusLabel(application.status)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status-specific messages */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    {application.status === "pending" && (
                      <p className="text-sm">
                        Your application is pending review. We will notify you once it is being processed.
                      </p>
                    )}
                    {application.status === "under_review" && (
                      <p className="text-sm">
                        Your application is currently under review. Our team is evaluating your documents.
                      </p>
                    )}
                    {application.status === "approved" && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Congratulations! Your visa application has been approved. You will receive further instructions via email.
                      </p>
                    )}
                    {application.status === "rejected" && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Unfortunately, your visa application has been rejected. Please contact our embassy for more information.
                      </p>
                    )}
                    {application.status === "on_hold" && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Your application is currently on hold. Additional information or documents may be required.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have questions about your application or need assistance, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {get("track_help_email", "visa@embassy.gov")}</p>
                  <p><strong>Phone:</strong> {get("track_help_phone", "+1 (555) 123-4567")}</p>
                  <p><strong>Office Hours:</strong> {get("track_help_hours", "Monday - Friday, 9:00 AM - 5:00 PM")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Track;
