import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plane, Briefcase, GraduationCap, Building, Globe, Users } from "lucide-react";
import SEOHead, { breadcrumbSchema } from "@/components/SEOHead";

const Services = () => {
  const visaTypes = [
    {
      icon: Plane,
      title: "Tourist Visa",
      description: "For leisure travel, visiting friends and family, or sightseeing purposes.",
      duration: "Up to 90 days",
      processing: "5-7 business days",
    },
    {
      icon: Briefcase,
      title: "Business Visa",
      description: "For business meetings, conferences, and professional engagements.",
      duration: "Up to 180 days",
      processing: "3-5 business days",
    },
    {
      icon: GraduationCap,
      title: "Student Visa",
      description: "For individuals enrolled in accredited educational institutions.",
      duration: "Duration of study",
      processing: "10-14 business days",
    },
    {
      icon: Building,
      title: "Work Visa",
      description: "For employment and professional work within the country.",
      duration: "1-3 years",
      processing: "14-21 business days",
    },
    {
      icon: Globe,
      title: "Transit Visa",
      description: "For travelers passing through on their way to another destination.",
      duration: "Up to 3 days",
      processing: "1-2 business days",
    },
    {
      icon: Users,
      title: "Diplomatic Visa",
      description: "For diplomatic and official government personnel.",
      duration: "Varies",
      processing: "Priority processing",
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Visa Services – Tourist, Business, Student & Work Visas"
        description="Apply for Bosnia and Herzegovina visas: tourist, business, student, work, transit, and diplomatic. Fast processing, online application, and document verification."
        canonical="/services"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Visa Services", url: "/services" },
        ])}
      />
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">Our Visa Services</h1>
            <p className="text-xl text-primary-foreground/90">
              Comprehensive visa solutions for all your travel needs
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visaTypes.map((visa, index) => {
              const Icon = visa.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle>{visa.title}</CardTitle>
                    <CardDescription className="min-h-[60px]">{visa.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-semibold">{visa.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing:</span>
                      <span className="font-semibold">{visa.processing}</span>
                    </div>
                    <Link to="/apply" className="block mt-4">
                      <Button className="w-full">Apply Now</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-12">Additional Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Document Verification</CardTitle>
                  <CardDescription>
                    We provide comprehensive document verification services to ensure your application 
                    meets all requirements.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Express Processing</CardTitle>
                  <CardDescription>
                    Need your visa urgently? We offer express processing services for eligible visa types 
                    (additional fees apply).
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Application Assistance</CardTitle>
                  <CardDescription>
                    Our team can help you complete your application form and ensure all information is 
                    accurate and complete.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Status Updates</CardTitle>
                  <CardDescription>
                    Track your application status online 24/7 and receive email notifications at every 
                    stage of processing.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4">Ready to Apply?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Start your visa application today with our secure online portal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg">
                Apply for Visa
              </Button>
            </Link>
            <Link to="/requirements">
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 text-primary-foreground font-semibold px-8 py-6 text-lg">
                View Requirements
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
