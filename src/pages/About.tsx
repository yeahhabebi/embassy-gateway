import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Globe, Award } from "lucide-react";

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">About Our Embassy</h1>
            <p className="text-xl text-primary-foreground/90">
              Serving the community with dedication, professionalism, and integrity
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-12">Our Mission</h2>
            <p className="text-lg text-muted-foreground text-center mb-8">
              The Embassy of the Republic is committed to providing efficient, transparent, and secure visa services 
              to all applicants. We strive to facilitate international travel while maintaining the highest standards 
              of security and diplomatic excellence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Security First</h3>
                      <p className="text-muted-foreground">
                        We prioritize the security of your personal information with state-of-the-art encryption 
                        and data protection measures.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Customer Service</h3>
                      <p className="text-muted-foreground">
                        Our dedicated team is committed to providing exceptional service and support 
                        throughout your visa application process.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
                      <p className="text-muted-foreground">
                        We facilitate international relations and travel, connecting people across borders 
                        and cultures.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Excellence</h3>
                      <p className="text-muted-foreground">
                        We maintain the highest professional standards in diplomatic services and 
                        visa processing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-8">Our History</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground text-center mb-6">
                Established in 1950, the Embassy of the Republic has been serving the international community 
                for over seven decades. Throughout our history, we have continuously evolved to meet the changing 
                needs of travelers while maintaining our commitment to excellence and security.
              </p>
              <p className="text-muted-foreground text-center">
                Our modern visa portal represents the latest step in our ongoing digital transformation, 
                making it easier than ever for applicants to access our services from anywhere in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto shadow-xl">
            <CardContent className="pt-8 text-center">
              <h2 className="mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-6">
                Have questions about our services? Our team is here to help.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-muted-foreground">
                    123 Embassy Street<br />
                    Capital City, 12345
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contact</h3>
                  <p className="text-muted-foreground">
                    Email: info@embassy.gov<br />
                    Phone: +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default About;
