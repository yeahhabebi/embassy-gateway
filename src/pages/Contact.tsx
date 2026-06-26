import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEOHead, { breadcrumbSchema, faqSchema } from "@/components/SEOHead";

const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255, "Name is too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),
  phone: z.string().trim().max(50, "Phone number is too long").optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    address: "E8/5, Vasant Vihar, New Delhi\nNew Delhi - 110057\nIndia",
    phone: "+91-11-26147415",
    email: "info@bhiembassy.asia",
    hours: "General Office: Mon-Fri 9:00-17:00\nConsular Services: Mon, Wed, Fri 10:00-12:00\nClosed: Weekends & Public Holidays",
    fax: "+91-11-26147415",
    emergency: "Available 24/7 for citizens in distress",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from("cms_content")
      .select("key, content")
      .in("key", ["embassy_address", "embassy_phone", "embassy_email", "embassy_hours", "embassy_fax", "embassy_emergency"]);

    if (data && data.length > 0) {
      const contentMap: Record<string, string> = {};
      data.forEach((item) => {
        if (item.key === "embassy_address") contentMap.address = item.content;
        if (item.key === "embassy_phone") contentMap.phone = item.content;
        if (item.key === "embassy_email") contentMap.email = item.content;
        if (item.key === "embassy_hours") contentMap.hours = item.content;
        if (item.key === "embassy_fax") contentMap.fax = item.content;
        if (item.key === "embassy_emergency") contentMap.emergency = item.content;
      });
      setContactInfo((prev) => ({ ...prev, ...contentMap }));
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('submit-contact', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
        },
      });

      if (error) throw error;
      
      if (response?.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      reset();
    } catch (error: any) {
      const errorMessage = error?.message?.includes('rate') || error?.message?.includes('Too many')
        ? error.message
        : "Failed to send message. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Contact Us – Embassy of Bosnia and Herzegovina"
        description="Contact the Embassy of Bosnia and Herzegovina in New Delhi: address, phone, email, and office hours for visa and consular inquiries."
        canonical="/contact"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Contact", url: "/contact" },
          ]),
          faqSchema([
            { question: "How long does visa processing take?", answer: "Processing times vary depending on the visa type. Tourist visas typically take 5-7 business days, while work visas may take 14-21 business days." },
            { question: "Can I apply for a visa online?", answer: "Yes! Our online visa portal allows you to complete your entire application, upload documents, and track your status from anywhere in the world." },
            { question: "What if my application is rejected?", answer: "If your application is rejected, you will receive a detailed explanation. You may reapply after addressing the issues mentioned in the rejection notice." },
            { question: "Do you offer expedited processing?", answer: "Yes, express processing is available for certain visa types with additional fees. Please contact us directly for more information." },
          ]),
        ]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-primary-foreground/90">
              Get in touch with the Embassy of Bosnia and Herzegovina in New Delhi
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Contact Information</h2>
            <p className="text-muted-foreground text-lg">Multiple ways to reach us for all your needs</p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Embassy Address Card */}
            <Card className="text-center py-10 px-6">
              <CardContent className="flex flex-col items-center gap-4 p-0">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Embassy Address</h3>
                <div className="text-muted-foreground space-y-1">
                  {contactInfo.address.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Phone & Fax Card */}
            <Card className="text-center py-10 px-6">
              <CardContent className="flex flex-col items-center gap-4 p-0">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center">
                  <Phone className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Phone & Fax</h3>
                <div className="text-muted-foreground space-y-1">
                  <p>Phone: {contactInfo.phone}</p>
                  <p>Fax: {contactInfo.fax}</p>
                </div>
              </CardContent>
            </Card>

            {/* Email Addresses Card */}
            <Card className="text-center py-10 px-6">
              <CardContent className="flex flex-col items-center gap-4 p-0">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center">
                  <Mail className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Email Addresses</h3>
                <div className="text-muted-foreground space-y-1">
                  <p>General: {contactInfo.email}</p>
                  <p>Consular: {contactInfo.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours Card */}
            <Card className="text-center py-10 px-6">
              <CardContent className="flex flex-col items-center gap-4 p-0">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center">
                  <Clock className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Office Hours</h3>
                <div className="text-muted-foreground space-y-1">
                  {contactInfo.hours.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Send Us a Message */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-primary text-2xl">
                  <Send className="h-5 w-5" />
                  Send Us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible. Fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        {...register("name")}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...register("email")}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        {...register("phone")}
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Controller
                        name="subject"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={errors.subject ? "border-destructive" : ""}>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Visa Inquiry">Visa Inquiry</SelectItem>
                              <SelectItem value="Consular Services">Consular Services</SelectItem>
                              <SelectItem value="Document Legalization">Document Legalization</SelectItem>
                              <SelectItem value="Trade & Investment">Trade & Investment</SelectItem>
                              <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your inquiry..."
                      rows={5}
                      {...register("message")}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent text-accent-foreground hover:brightness-110 font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">How long does visa processing take?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Processing times vary depending on the visa type. Tourist visas typically take 5-7 business days, 
                    while work visas may take 14-21 business days. You can track your application status online.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Can I apply for a visa online?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! Our online visa portal allows you to complete your entire application, upload documents, 
                    and track your status from anywhere in the world.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What if my application is rejected?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    If your application is rejected, you will receive a detailed explanation. You may reapply 
                    after addressing the issues mentioned in the rejection notice. Application fees are non-refundable.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Do you offer expedited processing?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, express processing is available for certain visa types with additional fees. 
                    Please contact us directly for more information about expedited services.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
