import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, Calendar, User, MapPin, Plane } from "lucide-react";

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
      const { data, error } = await supabase
        .from("visa_applications")
        .select("*")
        .eq("passport_number", passportNumber.trim())
        .eq("date_of_birth", dateOfBirth)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Application Not Found",
          description: "No application found with the provided details. Please check your passport number and date of birth.",
          variant: "destructive",
        });
        setApplication(null);
      } else {
        setApplication(data);
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
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "under_review":
        return "bg-blue-500";
      case "on_hold":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="h-16 w-16 mx-auto mb-6" />
            <h1 className="mb-6">Track Your Application</h1>
            <p className="text-xl text-primary-foreground/90">
              Check the status of your visa application
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Search Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Enter Your Details</CardTitle>
                <CardDescription>
                  Please provide your passport number and date of birth to track your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number</Label>
                    <Input
                      id="passport_number"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="Enter your passport number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      "Searching..."
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search Application
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
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{application.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nationality</p>
                        <p className="font-medium">{application.nationality}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{new Date(application.date_of_birth).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Visa Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Plane className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Visa Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Visa Type</p>
                        <p className="font-medium capitalize">{application.visa_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Intended Arrival</p>
                        <p className="font-medium">{new Date(application.intended_arrival_date).toLocaleDateString()}</p>
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
                      <div className="relative border-l-2 border-muted pl-6 pb-4">
                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="font-medium">{new Date(application.submission_date).toLocaleString()}</p>
                      </div>
                      <div className="relative border-l-2 border-muted pl-6">
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
                  <p><strong>Email:</strong> visa@embassy.gov</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM</p>
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