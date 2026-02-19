import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCMSContent } from "@/hooks/useCMSContent";
import SEOHead, { breadcrumbSchema } from "@/components/SEOHead";
import { FileText, User, BookOpen, Plane, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const CMS_KEYS = [
  "apply_hero_title",
  "apply_hero_subtitle",
  "apply_step1_title",
  "apply_step1_description",
  "apply_step2_title",
  "apply_step2_description",
  "apply_step3_title",
  "apply_step3_description",
  "apply_step4_title",
  "apply_step4_description",
  "apply_submit_button",
  "apply_success_title",
  "apply_success_message",
  "apply_disclaimer",
];

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  passport_number: string;
  passport_issue_date: string;
  passport_expiry_date: string;
  passport_issue_country: string;
  visa_type: string;
  intended_arrival_date: string;
  intended_departure_date: string;
  duration_of_stay: string;
  purpose_of_visit: string;
  notes: string;
};

const initialForm: FormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  nationality: "",
  address: "",
  city: "",
  country: "",
  postal_code: "",
  passport_number: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  passport_issue_country: "",
  visa_type: "",
  intended_arrival_date: "",
  intended_departure_date: "",
  duration_of_stay: "",
  purpose_of_visit: "",
  notes: "",
};

const STEPS = [
  { icon: User, label: "Personal Info" },
  { icon: BookOpen, label: "Passport Details" },
  { icon: Plane, label: "Travel Info" },
  { icon: CheckCircle, label: "Review & Submit" },
];

const Apply = () => {
  const { toast } = useToast();
  const { get } = useCMSContent(CMS_KEYS);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState<string | null>(null);

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validateStep = (s: number): string[] => {
    const errors: string[] = [];
    if (s === 0) {
      if (!form.first_name.trim()) errors.push("First name is required");
      if (!form.last_name.trim()) errors.push("Last name is required");
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push("Valid email is required");
      if (!form.phone.trim()) errors.push("Phone number is required");
      if (!form.gender) errors.push("Gender is required");
      if (!form.date_of_birth) errors.push("Date of birth is required");
      if (!form.nationality.trim()) errors.push("Nationality is required");
      if (!form.address.trim()) errors.push("Address is required");
      if (!form.city.trim()) errors.push("City is required");
      if (!form.country.trim()) errors.push("Country is required");
    } else if (s === 1) {
      if (!form.passport_number.trim()) errors.push("Passport number is required");
      if (!form.passport_issue_date) errors.push("Passport issue date is required");
      if (!form.passport_expiry_date) errors.push("Passport expiry date is required");
      if (!form.passport_issue_country.trim()) errors.push("Passport issue country is required");
    } else if (s === 2) {
      if (!form.visa_type) errors.push("Visa type is required");
      if (!form.intended_arrival_date) errors.push("Intended arrival date is required");
      if (form.purpose_of_visit.trim().length < 10) errors.push("Purpose of visit must be at least 10 characters");
    }
    return errors;
  };

  const goNext = () => {
    const errors = validateStep(step);
    if (errors.length > 0) {
      toast({ title: "Please fix the following", description: errors.join(". "), variant: "destructive" });
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-application", {
        body: {
          ...form,
          duration_of_stay: form.duration_of_stay ? Number(form.duration_of_stay) : null,
        },
      });

      if (error) throw error;
      if (data?.error) {
        const details = data.details ? data.details.join(". ") : data.error;
        throw new Error(details);
      }

      setApplicationNumber(data.application_number);
      toast({ title: "Application Submitted!", description: `Reference: ${data.application_number}` });
    } catch (err: any) {
      toast({ title: "Submission Failed", description: err.message || "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (applicationNumber) {
    return (
      <Layout>
        <SEOHead title="Application Submitted" description="Your visa application has been submitted." canonical="/apply" />
        <section className="bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-6" />
            <h1 className="mb-4">{get("apply_success_title", "Application Submitted!")}</h1>
            <p className="text-xl text-primary-foreground/90">{get("apply_success_message", "Your visa application has been received and is being processed.")}</p>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-xl text-center">
            <Card>
              <CardHeader>
                <CardTitle>Your Reference Number</CardTitle>
                <CardDescription>Please save this number to track your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-3xl font-bold text-primary">{applicationNumber}</p>
                <p className="text-sm text-muted-foreground">You can use this number along with your passport number and date of birth on the Track Application page.</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.location.href = "/track"}>Track Application</Button>
                  <Button variant="outline" onClick={() => window.location.href = "/"}>Back to Home</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title="Apply for a Visa - Embassy of Bosnia and Herzegovina"
        description="Apply for a visa to Bosnia and Herzegovina. Complete the online application form with your personal information, passport details, and travel plans."
        canonical="/apply"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Apply for Visa", url: "/apply" },
        ])}
      />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <FileText className="h-16 w-16 mx-auto mb-6" />
          <h1 className="mb-6">{get("apply_hero_title", "Apply for a Visa")}</h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            {get("apply_hero_subtitle", "Complete the form below to submit your visa application to the Embassy of Bosnia and Herzegovina")}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Step indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((s, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className="text-xs hidden sm:block">{s.label}</span>
                </div>
              ))}
            </div>
            <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
          </div>

          {/* Step 1: Personal Info */}
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{get("apply_step1_title", "Personal Information")}</CardTitle>
                <CardDescription>{get("apply_step1_description", "Please provide your personal details as they appear on your passport")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input id="first_name" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input id="last_name" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} maxLength={100} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={30} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <RadioGroup value={form.gender} onValueChange={(v) => update("gender", v)} className="flex gap-4 pt-2">
                      <div className="flex items-center gap-2"><RadioGroupItem value="male" id="male" /><Label htmlFor="male">Male</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="female" id="female" /><Label htmlFor="female">Female</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="other" id="other" /><Label htmlFor="other">Other</Label></div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input id="dob" type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input id="nationality" value={form.nationality} onChange={(e) => update("nationality", e.target.value)} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea id="address" value={form.address} onChange={(e) => update("address", e.target.value)} maxLength={500} rows={2} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input id="postal_code" value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} maxLength={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Passport Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>{get("apply_step2_title", "Passport Details")}</CardTitle>
                <CardDescription>{get("apply_step2_description", "Enter your passport information exactly as it appears on your travel document")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number *</Label>
                    <Input id="passport_number" value={form.passport_number} onChange={(e) => update("passport_number", e.target.value)} maxLength={20} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_issue_country">Issuing Country *</Label>
                    <Input id="passport_issue_country" value={form.passport_issue_country} onChange={(e) => update("passport_issue_country", e.target.value)} maxLength={100} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport_issue_date">Issue Date *</Label>
                    <Input id="passport_issue_date" type="date" value={form.passport_issue_date} onChange={(e) => update("passport_issue_date", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_expiry_date">Expiry Date *</Label>
                    <Input id="passport_expiry_date" type="date" value={form.passport_expiry_date} onChange={(e) => update("passport_expiry_date", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Travel Info */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>{get("apply_step3_title", "Travel Information")}</CardTitle>
                <CardDescription>{get("apply_step3_description", "Provide details about your planned visit to Bosnia and Herzegovina")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visa_type">Visa Type *</Label>
                  <Select value={form.visa_type} onValueChange={(v) => update("visa_type", v)}>
                    <SelectTrigger id="visa_type"><SelectValue placeholder="Select visa type" /></SelectTrigger>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrival">Intended Arrival Date *</Label>
                    <Input id="arrival" type="date" value={form.intended_arrival_date} onChange={(e) => update("intended_arrival_date", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departure">Intended Departure Date</Label>
                    <Input id="departure" type="date" value={form.intended_departure_date} onChange={(e) => update("intended_departure_date", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration of Stay (days)</Label>
                  <Input id="duration" type="number" min="1" max="365" value={form.duration_of_stay} onChange={(e) => update("duration_of_stay", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Visit *</Label>
                  <Textarea id="purpose" value={form.purpose_of_visit} onChange={(e) => update("purpose_of_visit", e.target.value)} maxLength={1000} rows={4} placeholder="Please describe the purpose of your visit in detail (min 10 characters)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} maxLength={1000} rows={3} placeholder="Any additional information you'd like to share" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>{get("apply_step4_title", "Review Your Application")}</CardTitle>
                <CardDescription>{get("apply_step4_description", "Please review all the information below before submitting your application")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-muted/50 rounded-lg p-4">
                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{form.first_name} {form.last_name}</span></div>
                    <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{form.email}</span></div>
                    <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{form.phone}</span></div>
                    <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium capitalize">{form.gender}</span></div>
                    <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium">{form.date_of_birth}</span></div>
                    <div><span className="text-muted-foreground">Nationality:</span> <span className="font-medium">{form.nationality}</span></div>
                    <div className="sm:col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{form.address}, {form.city}, {form.country} {form.postal_code}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Passport Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-muted/50 rounded-lg p-4">
                    <div><span className="text-muted-foreground">Passport #:</span> <span className="font-medium">{form.passport_number}</span></div>
                    <div><span className="text-muted-foreground">Issue Country:</span> <span className="font-medium">{form.passport_issue_country}</span></div>
                    <div><span className="text-muted-foreground">Issue Date:</span> <span className="font-medium">{form.passport_issue_date}</span></div>
                    <div><span className="text-muted-foreground">Expiry Date:</span> <span className="font-medium">{form.passport_expiry_date}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Plane className="h-5 w-5 text-primary" /> Travel Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-muted/50 rounded-lg p-4">
                    <div><span className="text-muted-foreground">Visa Type:</span> <span className="font-medium capitalize">{form.visa_type}</span></div>
                    <div><span className="text-muted-foreground">Arrival:</span> <span className="font-medium">{form.intended_arrival_date}</span></div>
                    {form.intended_departure_date && <div><span className="text-muted-foreground">Departure:</span> <span className="font-medium">{form.intended_departure_date}</span></div>}
                    {form.duration_of_stay && <div><span className="text-muted-foreground">Duration:</span> <span className="font-medium">{form.duration_of_stay} days</span></div>}
                    <div className="sm:col-span-2"><span className="text-muted-foreground">Purpose:</span> <span className="font-medium">{form.purpose_of_visit}</span></div>
                    {form.notes && <div className="sm:col-span-2"><span className="text-muted-foreground">Notes:</span> <span className="font-medium">{form.notes}</span></div>}
                  </div>
                </div>

                <div className="bg-muted/30 border rounded-lg p-4 text-sm text-muted-foreground">
                  {get("apply_disclaimer", "By submitting this application, you confirm that all the information provided is accurate and complete. False or misleading information may result in the rejection of your application.")}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={goBack} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={goNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  get("apply_submit_button", "Submit Application")
                )}
              </Button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Apply;
