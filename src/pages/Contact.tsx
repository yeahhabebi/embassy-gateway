import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, FileText } from "lucide-react";

const Contact = () => {
  return (
    <Layout>
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
                  <p className="text-foreground">
                    123 Embassy Street<br />
                    Capital City, 12345<br />
                    Country Name
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
                  <div className="space-y-2">
                    <p className="text-foreground font-semibold">Consular Services:</p>
                    <p className="text-muted-foreground">
                      Monday - Friday<br />
                      9:00 AM - 5:00 PM
                    </p>
                    <p className="text-foreground font-semibold mt-4">Visa Applications:</p>
                    <p className="text-muted-foreground">
                      By Appointment Only
                    </p>
                  </div>
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
                  <p className="text-foreground mb-2">
                    <strong>Main Line:</strong><br />
                    +1 (555) 123-4567
                  </p>
                  <p className="text-foreground">
                    <strong>Emergency Line:</strong><br />
                    +1 (555) 123-4999
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
                  <p className="text-foreground mb-2">
                    <strong>General Inquiries:</strong><br />
                    info@embassy.gov
                  </p>
                  <p className="text-foreground">
                    <strong>Visa Services:</strong><br />
                    visa@embassy.gov
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
                    <p className="text-muted-foreground">+1 (555) 123-4568</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Emergency Consular Services</p>
                    <p className="text-muted-foreground">Available 24/7 for citizens in distress</p>
                  </div>
                </div>
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
