import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Clock, CheckCircle, Globe, Award } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const [content, setContent] = useState({
    hero_title: "Welcome to the Embassy Visa Portal",
    hero_subtitle: "Apply for your visa online - Fast, Secure, and Convenient",
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from("cms_content")
      .select("key, content")
      .in("key", ["homepage_hero_title", "homepage_hero_subtitle"]);

    if (data && data.length > 0) {
      const contentMap: Record<string, string> = {};
      data.forEach((item) => {
        if (item.key === "homepage_hero_title") contentMap.hero_title = item.content;
        if (item.key === "homepage_hero_subtitle") contentMap.hero_subtitle = item.content;
      });
      setContent((prev) => ({ ...prev, ...contentMap }));
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="mb-6 font-bold">{content.hero_title}</h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              {content.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/apply">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg shadow-lg">
                  Apply for Visa
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 text-primary-foreground font-semibold px-8 py-6 text-lg">
                  Track Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Why Choose Our Visa Services?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide efficient, secure, and transparent visa processing services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Process</CardTitle>
                <CardDescription>
                  Your data is protected with industry-standard encryption and security measures
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fast Processing</CardTitle>
                <CardDescription>
                  Get your visa processed quickly with our streamlined online application system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Application</CardTitle>
                <CardDescription>
                  Simple step-by-step process to complete your visa application online
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-time Tracking</CardTitle>
                <CardDescription>
                  Track your application status anytime with your passport number and date of birth
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multiple Visa Types</CardTitle>
                <CardDescription>
                  Tourist, business, student, work, transit, and diplomatic visas available
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Professional Support</CardTitle>
                <CardDescription>
                  Our experienced team is here to help you through every step of the process
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4">Ready to Apply?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Start your visa application today and join thousands of successful applicants
          </p>
          <Link to="/apply">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg shadow-xl">
              Start Your Application
            </Button>
          </Link>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">How It Works</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Complete Application</h3>
                    <p className="text-muted-foreground">
                      Fill out the online visa application form with your personal and travel information
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
                    <p className="text-muted-foreground">
                      Submit required documents including passport copy and supporting materials
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Track Status</h3>
                    <p className="text-muted-foreground">
                      Monitor your application progress online using your tracking information
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Receive Decision</h3>
                    <p className="text-muted-foreground">
                      Get notified via email when your visa application has been processed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Need Help?</CardTitle>
                <CardDescription>
                  Our support team is ready to assist you with your visa application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-1">Email</p>
                  <p className="text-muted-foreground">info@embassy.gov</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Phone</p>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Office Hours</p>
                  <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM</p>
                </div>
                <Link to="/contact">
                  <Button className="w-full mt-4">Contact Us</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
