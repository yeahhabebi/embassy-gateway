import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Clock, CheckCircle, Globe, Award } from "lucide-react";
import Layout from "@/components/Layout";
import { useCMSContent } from "@/hooks/useCMSContent";
import SEOHead, { embassyOrganizationSchema, breadcrumbSchema, websiteSchema } from "@/components/SEOHead";
const embassyHeroWebp = "/images/embassy-hero.webp";
const embassyHero1280Webp = "/images/embassy-hero-1280.webp";
const embassyHero768Webp = "/images/embassy-hero-768.webp";
const embassyHeroJpg = "/images/embassy-hero.jpg";

const Home = () => {
  const { get } = useCMSContent([
    "homepage_hero_title",
    "homepage_hero_subtitle",
    "homepage_about",
    "embassy_address",
    "embassy_phone",
    "embassy_email",
    "embassy_hours",
    "services_intro",
  ]);

  return (
    <Layout>
      <SEOHead
        title="Embassy of Bosnia and Herzegovina in New Delhi, India"
        description="Official website of the Embassy of Bosnia and Herzegovina in New Delhi. Apply for visas, access consular services, track applications, and learn about BiH-India relations."
        canonical="/"
        jsonLd={[
          embassyOrganizationSchema,
          websiteSchema,
          breadcrumbSchema([{ name: "Home", url: "/" }]),
        ]}
      />
      {/* Hero Section */}
      <section className="relative text-primary-foreground py-24 md:py-36 overflow-hidden">
        <picture>
          <source
            type="image/webp"
            srcSet={`${embassyHero768Webp} 768w, ${embassyHero1280Webp} 1280w, ${embassyHeroWebp} 1920w`}
            sizes="100vw"
          />
          <img
            src={embassyHeroJpg}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 z-0 w-full h-full object-cover"
            width={1920}
            height={988}
            sizes="100vw"
            srcSet={`${embassyHeroJpg} 1920w`}
          />
        </picture>
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/75" />
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="mb-6 font-bold">
              {get("homepage_hero_title", "Welcome to the Embassy of Bosnia and Herzegovina")}
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-foreground/90">
              {get("homepage_hero_subtitle", "Serving the Bosnian community and promoting bilateral relations between Bosnia and Herzegovina and India")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/services">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground font-semibold px-8 py-6 text-lg">
                  Consular Services
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground font-semibold px-8 py-6 text-lg">
                  About Bosnia and Herzegovina
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <Link to="/track">
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 shadow-lg">
                  Track Your Application
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 shadow-lg">
                  Emergency Contact
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full bg-primary-foreground text-primary border-2 hover:bg-primary-foreground/90 font-semibold py-6">
                  Office Hours & Location
                </Button>
              </Link>
              <Link to="/requirements">
                <Button size="lg" variant="outline" className="w-full bg-primary-foreground text-primary border-2 hover:bg-primary-foreground/90 font-semibold py-6">
                  Document Requirements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Our Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {get("services_intro", "We provide comprehensive consular and diplomatic services to support citizens and strengthen bilateral relations")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up">
              <CardHeader>
                <div className="bg-primary w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-center">Visa Services</CardTitle>
                <CardDescription className="text-center">
                  Apply for visas to Bosnia and Herzegovina for tourism, business, or other purposes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <div className="bg-primary w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-center">Consular Services</CardTitle>
                <CardDescription className="text-center">
                  Passport renewal, document legalization, and other consular assistance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <div className="bg-primary w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Globe className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-center">Trade & Investment</CardTitle>
                <CardDescription className="text-center">
                  Explore business opportunities and investment prospects in Bosnia and Herzegovina
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <div className="bg-primary w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Award className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-center">Cultural Events</CardTitle>
                <CardDescription className="text-center">
                  Stay updated on cultural events and activities organized by the embassy
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Embassy Information Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Embassy Information</CardTitle>
                <CardDescription>
                  Contact details and office hours for the Embassy of Bosnia and Herzegovina
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-1">Address</p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {get("embassy_address", "New Delhi - 110001, India")}
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Phone</p>
                  <p className="text-muted-foreground">{get("embassy_phone", "+91-11-26147415")}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Email</p>
                  <p className="text-muted-foreground">{get("embassy_email", "info@bihembassy.com")}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Office Hours</p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {get("embassy_hours", "Monday - Friday, 9:00 AM - 5:00 PM")}
                  </p>
                </div>
                <Link to="/contact">
                  <Button className="w-full mt-4">Contact Us</Button>
                </Link>
              </CardContent>
            </Card>

            <div>
              <h2 className="mb-8">Latest Updates</h2>
              <div className="space-y-6">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl">New Visa Requirements</CardTitle>
                    <CardDescription>
                      Updated visa requirements for Indian citizens traveling to Bosnia and Herzegovina
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">December 2024</p>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl">Cultural Festival</CardTitle>
                    <CardDescription>
                      Annual Bosnia and Herzegovina Cultural Festival in New Delhi
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">November 2024</p>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl">Trade Delegation Visit</CardTitle>
                    <CardDescription>
                      Business delegation from Bosnia and Herzegovina visits India
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">October 2024</p>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
