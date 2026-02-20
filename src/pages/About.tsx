import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Globe, Award, Heart, Building, Landmark, TrendingUp, Mountain } from "lucide-react";
import mostarBridge from "@/assets/mostar-bridge.jpg";
import sarajevoCityscape from "@/assets/sarajevo-cityscape.jpg";
import { useCMSContent } from "@/hooks/useCMSContent";
import SEOHead, { breadcrumbSchema } from "@/components/SEOHead";

const About = () => {
  const { get } = useCMSContent([
    "about_page_content",
    "about_page_subtitle",
    "embassy_address",
    "embassy_email",
    "embassy_phone",
    "embassy_hours",
  ]);

  return (
    <Layout>
      <SEOHead
        title="About Bosnia and Herzegovina"
        description="Learn about Bosnia and Herzegovina – its rich history, cultural diversity, natural beauty, and diplomatic relations with India. Discover Sarajevo, Mostar, and more."
        canonical="/about"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ])}
      />
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-16 md:py-24 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${sarajevoCityscape})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">About Bosnia and Herzegovina</h1>
            <p className="text-xl text-primary-foreground/90">
              {get("about_page_subtitle", "A country of rich history, diverse culture, and warm hospitality in the heart of Southeast Europe")}
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="mb-6">About Bosnia and Herzegovina</h2>
                <div className="space-y-4 text-muted-foreground">
                  {get("about_page_content", "Bosnia and Herzegovina is a country located in Southeast Europe, on the Balkan Peninsula. Known for its natural beauty, cultural diversity, and historical significance, Bosnia and Herzegovina offers a unique blend of Eastern and Western influences.\n\nThe country is characterized by its stunning landscapes, ranging from the Dinaric Alps to the Adriatic coast, medieval villages, and vibrant cities. Sarajevo, the capital, is known as the \"Jerusalem of Europe\" for its religious diversity and coexistence.")
                    .split("\n\n")
                    .map((paragraph, i) => (
                      <p key={i} className="text-lg">{paragraph}</p>
                    ))}
                </div>
              </div>
              <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src={mostarBridge} 
                  alt="Mostar Old Bridge – UNESCO World Heritage site in Bosnia and Herzegovina" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={600}
                  height={400}
                />
              </div>
            </div>

            {/* Key Facts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border hover:shadow-lg transition-all">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Globe className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-primary mb-3">Capital</h3>
                  <p className="text-accent text-xl font-bold mb-2">Sarajevo</p>
                  <p className="text-muted-foreground text-sm">A historic city at the crossroads of East and West</p>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-lg transition-all">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Users className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-primary mb-3">Population</h3>
                  <p className="text-accent text-xl font-bold mb-2">3.2 Million</p>
                  <p className="text-muted-foreground text-sm">Diverse ethnic groups living in harmony</p>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-lg transition-all">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Globe className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-primary mb-3">Languages</h3>
                  <p className="text-accent text-xl font-bold mb-2">Bosnian, Croatian, Serbian</p>
                  <p className="text-muted-foreground text-sm">Three official languages with Latin and Cyrillic scripts</p>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-lg transition-all">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Mountain className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-primary mb-3">Geography</h3>
                  <p className="text-accent text-xl font-bold mb-2">51,197 km²</p>
                  <p className="text-muted-foreground text-sm">Mountainous country with stunning natural landscapes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Culture & Heritage Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center mb-12">Culture & Heritage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Cultural Diversity</h3>
                  <p className="text-muted-foreground">
                    Bosnia and Herzegovina is a melting pot of cultures, where East meets West. The country 
                    showcases influences from Ottoman, Austro-Hungarian, and Mediterranean civilizations, 
                    creating a unique cultural tapestry.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                    <Landmark className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Historical Significance</h3>
                  <p className="text-muted-foreground">
                    From medieval fortresses to Ottoman-era bridges and Austro-Hungarian architecture, 
                    the country preserves centuries of history. The Old Bridge in Mostar is a UNESCO 
                    World Heritage site and symbol of reconciliation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Arts & Traditions</h3>
                  <p className="text-muted-foreground">
                    Bosnia and Herzegovina is known for its traditional crafts including copperwork, 
                    wood carving, and carpet weaving. The country has a rich tradition of music, 
                    literature, and film that reflects its diverse heritage.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* BiH-India Relations Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center mb-12">Bosnia and Herzegovina - India Relations</h2>
            
            <div className="mb-12">
              <p className="text-lg text-muted-foreground text-center mb-8">
                Bosnia and Herzegovina and India enjoy warm and friendly bilateral relations based on 
                mutual respect, understanding, and shared commitment to democracy and development.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Diplomatic Relations</h3>
                      <p className="text-muted-foreground">
                        India recognized Bosnia and Herzegovina's independence in 1992, and diplomatic 
                        relations were established shortly thereafter. The Embassy in New Delhi serves 
                        as a vital link between our two nations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Economic Cooperation</h3>
                      <p className="text-muted-foreground">
                        Both countries are actively working to enhance trade and investment opportunities 
                        in sectors such as IT, pharmaceuticals, agriculture, and tourism.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Cultural Exchange</h3>
                      <p className="text-muted-foreground">
                        The embassy regularly organizes cultural events, film screenings, and art exhibitions 
                        to promote Bosnian culture in India and vice versa.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Multilateral Cooperation</h3>
                      <p className="text-muted-foreground">
                        Both nations collaborate on various international platforms including the United 
                        Nations and the Non-Aligned Movement.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-semibold mb-4 text-center">Our Mission</h3>
                <p className="text-primary-foreground/90 text-center text-lg mb-6">
                  The Embassy of Bosnia and Herzegovina in New Delhi is committed to strengthening the bonds 
                  of friendship between our two nations, promoting mutual understanding, and providing excellent 
                  consular services to both Bosnian citizens in India and Indian citizens interested in visiting 
                  Bosnia and Herzegovina.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/services">
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                      View Our Services
                    </Button>
                  </Link>
                  <Link to="/apply">
                    <Button size="lg" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 text-primary-foreground font-semibold">
                      Apply for Visa
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto shadow-xl">
            <CardContent className="pt-8 text-center">
              <h2 className="mb-4">Contact the Embassy</h2>
              <p className="text-muted-foreground mb-6">
                For consular services, visa inquiries, or general information, please reach out to us.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {get("embassy_address", "Embassy of Bosnia and Herzegovina\nNew Delhi - 110001, India")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contact</h3>
                  <p className="text-muted-foreground">
                    Email: {get("embassy_email", "info@bihembassy.com")}<br />
                    Phone: {get("embassy_phone", "+91-11-26147415")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Office Hours</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {get("embassy_hours", "Monday - Friday\n9:00 AM - 5:00 PM")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Consular Hours</h3>
                  <p className="text-muted-foreground">
                    Monday, Wednesday, Friday<br />
                    10:00 AM - 12:00 PM
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
