import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ArrowLeft, FileText, Upload, CheckCircle } from "lucide-react";
import { z } from "zod";

const visaApplicationSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(1, "Phone number is required").max(50),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required").max(100),
  passport_number: z.string().min(1, "Passport number is required").max(50),
  passport_issue_date: z.string().min(1, "Issue date is required"),
  passport_expiry_date: z.string().min(1, "Expiry date is required"),
  passport_issue_country: z.string().min(1, "Issue country is required").max(100),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  postal_code: z.string().max(20).optional(),
  visa_type: z.string().min(1, "Visa type is required"),
  purpose_of_visit: z.string().min(1, "Purpose of visit is required").max(1000),
  intended_arrival_date: z.string().min(1, "Arrival date is required"),
  duration_of_stay: z.number().min(1, "Duration must be at least 1 day").optional(),
});

const Apply = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  
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
    visa_type: "",
    purpose_of_visit: "",
    intended_arrival_date: "",
    duration_of_stay: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    try {
      if (currentStep === 1) {
        z.object({
          first_name: visaApplicationSchema.shape.first_name,
          last_name: visaApplicationSchema.shape.last_name,
          email: visaApplicationSchema.shape.email,
          phone: visaApplicationSchema.shape.phone,
          date_of_birth: visaApplicationSchema.shape.date_of_birth,
          gender: visaApplicationSchema.shape.gender,
          nationality: visaApplicationSchema.shape.nationality,
        }).parse({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          nationality: formData.nationality,
        });
      } else if (currentStep === 2) {
        z.object({
          passport_number: visaApplicationSchema.shape.passport_number,
          passport_issue_date: visaApplicationSchema.shape.passport_issue_date,
          passport_expiry_date: visaApplicationSchema.shape.passport_expiry_date,
          passport_issue_country: visaApplicationSchema.shape.passport_issue_country,
        }).parse({
          passport_number: formData.passport_number,
          passport_issue_date: formData.passport_issue_date,
          passport_expiry_date: formData.passport_expiry_date,
          passport_issue_country: formData.passport_issue_country,
        });
      } else if (currentStep === 3) {
        z.object({
          address: visaApplicationSchema.shape.address,
          city: visaApplicationSchema.shape.city,
          country: visaApplicationSchema.shape.country,
        }).parse({
          address: formData.address,
          city: formData.city,
          country: formData.country,
        });
      } else if (currentStep === 4) {
        z.object({
          visa_type: visaApplicationSchema.shape.visa_type,
          purpose_of_visit: visaApplicationSchema.shape.purpose_of_visit,
          intended_arrival_date: visaApplicationSchema.shape.intended_arrival_date,
        }).parse({
          visa_type: formData.visa_type,
          purpose_of_visit: formData.purpose_of_visit,
          intended_arrival_date: formData.intended_arrival_date,
        });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      const applicationData = {
        ...formData,
        duration_of_stay: formData.duration_of_stay ? parseInt(formData.duration_of_stay) : null,
        application_number: "",
        visa_type: formData.visa_type as "tourist" | "business" | "student" | "work" | "transit" | "diplomatic",
      };

      const { data, error } = await supabase
        .from("visa_applications")
        .insert([applicationData])
        .select()
        .single();

      if (error) throw error;

      // Upload documents if any
      if (files && files.length > 0 && data) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${data.id}_${Date.now()}_${i}.${fileExt}`;
          const filePath = `${data.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('visa-documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Save document metadata
          await supabase.from('application_documents').insert({
            application_id: data.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            document_type: file.type,
          });
        }
      }

      setApplicationNumber(data.application_number);
      setStep(5);
      
      toast({
        title: "Success!",
        description: "Your visa application has been submitted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">Visa Application</h1>
            <p className="text-xl text-primary-foreground/90">
              Complete your visa application online
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            {step < 5 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {s}
                      </div>
                      {s < 4 && (
                        <div className={`w-16 md:w-32 h-1 ${
                          s < step ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Personal Info</span>
                  <span>Passport</span>
                  <span>Address</span>
                  <span>Travel Info</span>
                </div>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Please provide your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange("nationality", e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={nextStep}>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Passport Information */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Passport Information</CardTitle>
                  <CardDescription>Please provide your passport details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number *</Label>
                    <Input
                      id="passport_number"
                      value={formData.passport_number}
                      onChange={(e) => handleInputChange("passport_number", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passport_issue_date">Issue Date *</Label>
                      <Input
                        id="passport_issue_date"
                        type="date"
                        value={formData.passport_issue_date}
                        onChange={(e) => handleInputChange("passport_issue_date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passport_expiry_date">Expiry Date *</Label>
                      <Input
                        id="passport_expiry_date"
                        type="date"
                        value={formData.passport_expiry_date}
                        onChange={(e) => handleInputChange("passport_expiry_date", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passport_issue_country">Issuing Country *</Label>
                    <Input
                      id="passport_issue_country"
                      value={formData.passport_issue_country}
                      onChange={(e) => handleInputChange("passport_issue_country", e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={nextStep}>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Address Information */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Please provide your residential address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={nextStep}>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Travel Information & Documents */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Travel Information & Documents</CardTitle>
                  <CardDescription>Please provide your travel details and upload required documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="visa_type">Visa Type *</Label>
                    <Select value={formData.visa_type} onValueChange={(value) => handleInputChange("visa_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visa type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tourist">Tourist Visa</SelectItem>
                        <SelectItem value="business">Business Visa</SelectItem>
                        <SelectItem value="student">Student Visa</SelectItem>
                        <SelectItem value="work">Work Visa</SelectItem>
                        <SelectItem value="transit">Transit Visa</SelectItem>
                        <SelectItem value="diplomatic">Diplomatic Visa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose_of_visit">Purpose of Visit *</Label>
                    <Textarea
                      id="purpose_of_visit"
                      value={formData.purpose_of_visit}
                      onChange={(e) => handleInputChange("purpose_of_visit", e.target.value)}
                      rows={3}
                      placeholder="Please describe the purpose of your visit..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      rows={3}
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documents">Upload Documents (Passport copy, photos, etc.)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <Input
                        id="documents"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="max-w-xs mx-auto"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Accepted formats: PDF, JPG, PNG (Max 10MB each)
                      </p>
                      {files && files.length > 0 && (
                        <p className="text-sm text-primary mt-2">
                          {files.length} file(s) selected
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-100 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl mb-2">Application Submitted Successfully!</CardTitle>
                    <CardDescription>Your visa application has been received</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Your Application Number</p>
                    <p className="text-2xl font-bold text-primary">{applicationNumber}</p>
                  </div>

                  <div className="text-left space-y-4">
                    <p className="text-muted-foreground">
                      Thank you for submitting your visa application. You will receive a confirmation email shortly.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Next Steps:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Save your application number for tracking</li>
                        <li>Check your email for confirmation</li>
                        <li>Track your application status online</li>
                        <li>Wait for notification about your visa decision</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => window.location.href = "/"}>
                      Back to Home
                    </Button>
                    <Button onClick={() => window.location.href = "/track"}>
                      <FileText className="mr-2 h-4 w-4" />
                      Track Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Apply;