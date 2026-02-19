import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Phone, Mail, Clock, FileText, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEOHead, { breadcrumbSchema, faqSchema } from "@/components/SEOHead";

const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255, "Name is too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),
  phone: z.string().trim().max(50, "Phone number is too long").optional(),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(500, "Subject is too long"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    address: "123 Embassy Street\nCapital City, 12345\nCountry Name",
    phone: "+1 (555) 123-4567",
    email: "info@embassy.gov",
    hours: "Monday - Friday\n9:00 AM - 5:00 PM",
    fax: "+1 (555) 123-4568",
    emergency: "Available 24/7 for citizens in distress",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
      // Don't log sensitive data - just the fact that an error occurred
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
        description="Contact the Embassy of Bosnia and Herzegovina in New Delhi, India. Find our address, phone, email, office hours, and send us a message for visa or consular inquiries."
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
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">Contact Us</h1>
            <p className="text-xl text-primary-foreground/90">
              Get in touch with our embassy team
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Visit Us</CardTitle>
                  <CardDescription>Our embassy location</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-line">
                    {contactInfo.address}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Office Hours</CardTitle>
                  <CardDescription>When we're available</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-line">
                    {contactInfo.hours}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Phone</CardTitle>
                  <CardDescription>Call us directly</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">
                    {contactInfo.phone}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>Send us a message</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">
                    {contactInfo.email}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Contact Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Additional Contact Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold mb-2">Fax</p>
                    <p className="text-muted-foreground">{contactInfo.fax}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Emergency Consular Services</p>
                    <p className="text-muted-foreground">{contactInfo.emergency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4">Send Us a Message</h2>
              <p className="text-muted-foreground text-lg">
                Have a question or inquiry? Fill out the form below and we'll get back to you shortly.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Contact Form</CardTitle>
                <CardDescription>
                  All fields marked with * are required
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register("name")}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        {...register("email")}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        {...register("phone")}
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Visa inquiry, general question, etc."
                      {...register("subject")}
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
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
                    className="w-full"
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
