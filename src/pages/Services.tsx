import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Stamp, Scale, BookOpen, Globe, Users, Shield, Briefcase, GraduationCap, Plane, Building, ChevronRight } from "lucide-react";
import SEOHead, { breadcrumbSchema, serviceSchema } from "@/components/SEOHead";

const Services = () => {
  const mainServices = [
    {
      icon: FileText,
      title: "Visa Services",
      description: "Apply for visas to Bosnia and Herzegovina for tourism, business, study, work, transit, or diplomatic purposes.",
      link: "/apply",
      linkText: "Apply for Visa",
    },
    {
      icon: Stamp,
      title: "Document Legalisation",
      description: "Authentication and legalisation of official documents for use in Bosnia and Herzegovina.",
      link: "/requirements",
      linkText: "View Requirements",
    },
    {
      icon: Scale,
      title: "Consular Assistance",
      description: "Passport renewal, civil registration, power of attorney, and other consular services for BiH citizens.",
      link: "/contact",
      linkText: "Contact Us",
    },
    {
      icon: Globe,
      title: "Trade & Investment",
      description: "Explore business opportunities and investment prospects in Bosnia and Herzegovina. We facilitate bilateral trade relations.",
      link: "/contact",
      linkText: "Explore Trade & Investment Opportunities",
    },
  ];

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

  const consularServices = [
    {
      icon: FileText,
      title: "Passport Services",
      description: "New passport applications, renewals, and emergency travel documents for citizens of Bosnia and Herzegovina.",
    },
    {
      icon: BookOpen,
      title: "Civil Registration",
      description: "Birth, marriage, and death registration services. Certificates and extracts from civil registries.",
    },
    {
      icon: Stamp,
      title: "Document Attestation",
      description: "Attestation and authentication of documents including educational certificates, commercial documents, and personal documents.",
    },
    {
      icon: Scale,
      title: "Legal Assistance",
      description: "Power of attorney, notarial services, and assistance with legal proceedings in Bosnia and Herzegovina.",
    },
    {
      icon: Shield,
      title: "Citizen Protection",
      description: "Emergency assistance, welfare checks, and support for BiH citizens in distress abroad.",
    },
    {
      icon: Users,
      title: "Diaspora Services",
      description: "Voter registration, pension matters, military service records, and other community services.",
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Consular Services"
        description="BiH Embassy consular services in New Delhi: visa applications, document legalisation, passport services, civil registration, and trade facilitation."
        canonical="/services"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Consular Services", url: "/services" },
          ]),
          ...serviceSchema([
            { name: "Visa Services", description: "Apply for visas to Bosnia and Herzegovina for tourism, business, study, work, transit, or diplomatic purposes.", url: "/apply" },
            { name: "Document Legalisation", description: "Authentication and legalisation of official documents for use in Bosnia and Herzegovina.", url: "/requirements" },
            { name: "Consular Assistance", description: "Passport renewal, civil registration, power of attorney, and other consular services for BiH citizens.", url: "/contact" },
            { name: "Passport Services", description: "New passport applications, renewals, and emergency travel documents for citizens of Bosnia and Herzegovina." },
            { name: "Document Attestation", description: "Attestation and authentication of documents including educational certificates, commercial documents, and personal documents." },
            { name: "Trade & Investment Facilitation", description: "Support for businesses exploring trade opportunities between India and Bosnia and Herzegovina." },
          ]),
        ]}
      />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Consular Services</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              We provide comprehensive consular and diplomatic services to support citizens and strengthen bilateral relations.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our range of consular and diplomatic services available at the Embassy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mainServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="text-center border-2 hover:border-accent/50 transition-all hover:shadow-lg group">
                  <CardHeader className="pb-4">
                    <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 min-h-[60px]">{service.description}</CardDescription>
                    <Link to={service.link}>
                      <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {service.linkText}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visa Types Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Visa Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the visa type that best suits your travel purpose to Bosnia and Herzegovina.
            </p>
          </div>
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
                    <CardDescription className="min-h-[48px]">{visa.description}</CardDescription>
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

      {/* Consular Services Detail */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Consular Assistance</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Services available for citizens of Bosnia and Herzegovina and foreign nationals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consularServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Document Legalisation Info */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Document Legalisation</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The Embassy provides document authentication and legalisation services for documents intended for use in Bosnia and Herzegovina.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Educational Documents</CardTitle>
                  <CardDescription>
                    Attestation of degrees, diplomas, transcripts, and other academic certificates for recognition in Bosnia and Herzegovina.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Commercial Documents</CardTitle>
                  <CardDescription>
                    Authentication of business documents, trade agreements, company registrations, and commercial certificates.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Personal Documents</CardTitle>
                  <CardDescription>
                    Legalisation of birth certificates, marriage certificates, police clearance certificates, and other personal documents.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Medical Documents</CardTitle>
                  <CardDescription>
                    Authentication of medical reports, health certificates, and vaccination records for travel or residency purposes.
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
          <h2 className="text-3xl font-bold mb-4">Need Assistance?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Contact us for more information about our consular services or to schedule an appointment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg">
                Apply for Visa
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 text-primary-foreground font-semibold px-8 py-6 text-lg">
                Contact Embassy
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
