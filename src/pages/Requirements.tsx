import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEOHead, { breadcrumbSchema, faqSchema } from "@/components/SEOHead";

const visaFAQs = [
  { question: "What documents are required for a Bosnia and Herzegovina visa?", answer: "You need a valid passport (6+ months validity), passport-sized photo, completed application form, proof of travel arrangements, proof of accommodation, bank statements for the last 3 months, and travel insurance." },
  { question: "What photo specifications are required for the visa application?", answer: "A recent passport-sized photograph of 2x2 inches with a white background is required." },
  { question: "Do I need travel insurance for a Bosnia and Herzegovina visa?", answer: "Yes, a valid travel insurance certificate is mandatory for all visa applications." },
  { question: "What additional documents are needed for a tourist visa?", answer: "Tourist visa applicants need a detailed travel itinerary, hotel reservations for the entire stay, and return flight tickets." },
  { question: "What additional documents are needed for a business visa?", answer: "Business visa applicants need an invitation letter from the host company, company registration documents, business meeting schedule, and an employment letter from their employer." },
  { question: "What file formats are accepted for document uploads?", answer: "All documents must be uploaded in PDF or JPG format with a maximum file size of 5MB per document." },
  { question: "Do documents need to be translated?", answer: "Yes, documents not in English must be accompanied by certified translations." },
  { question: "Are visa application fees refundable?", answer: "No, visa application fees are non-refundable regardless of the outcome of your application." },
];

const Requirements = () => {
  return (
    <Layout>
      <SEOHead
        title="Visa Requirements"
        description="Bosnia and Herzegovina visa requirements: passport, photos, financial proof, and travel insurance for tourist, business, student, and work visas."
        canonical="/requirements"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Visa Requirements", url: "/requirements" },
          ]),
          faqSchema(visaFAQs),
        ]}
      />
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">Visa Requirements</h1>
            <p className="text-xl text-primary-foreground/90">
              Everything you need to know before applying
            </p>
          </div>
        </div>
      </section>

      {/* General Requirements */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Alert className="mb-8 border-primary/20 bg-primary/5">
              <AlertCircle className="h-5 w-5 text-primary" />
              <AlertDescription className="text-base">
                Please ensure all documents are clear, legible, and meet the specified requirements. 
                Incomplete applications may result in delays or rejection.
              </AlertDescription>
            </Alert>

            <h2 className="mb-8">General Requirements</h2>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Valid passport with at least 6 months validity from intended date of entry",
                    "Recent passport-sized photograph (2x2 inches, white background)",
                    "Completed visa application form",
                    "Proof of travel arrangements (flight bookings)",
                    "Proof of accommodation (hotel reservation or invitation letter)",
                    "Financial proof (bank statements for last 3 months)",
                    "Travel insurance certificate",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Visa-Specific Requirements */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-8 text-center">Additional Requirements by Visa Type</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tourist Visa</CardTitle>
                  <CardDescription>Additional documents required for tourist visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Detailed travel itinerary</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Hotel reservations for entire stay</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Return flight tickets</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Visa</CardTitle>
                  <CardDescription>Additional documents required for business visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Invitation letter from host company</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Company registration documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Business meeting schedule or conference details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Employment letter from your employer</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Visa</CardTitle>
                  <CardDescription>Additional documents required for student visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Letter of acceptance from educational institution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Proof of payment of tuition fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Academic transcripts and certificates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Proof of sufficient funds for living expenses</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Work Visa</CardTitle>
                  <CardDescription>Additional documents required for work visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Employment contract or job offer letter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Work permit or labor approval</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Professional qualifications and certificates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span>Resume/CV</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-8">Important Notes</h2>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Document Format:</strong> All documents must be uploaded in PDF or JPG format. 
                  Maximum file size is 5MB per document.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertDescription>
                  <strong>Translation:</strong> Documents not in English must be accompanied by certified translations.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertDescription>
                  <strong>Processing Time:</strong> Processing times vary by visa type. Please apply well in advance 
                  of your intended travel date.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertDescription>
                  <strong>Fees:</strong> Visa application fees are non-refundable, regardless of the outcome 
                  of your application.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4">Ready to Apply?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Make sure you have all required documents before starting your application
          </p>
          <Link to="/apply">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg">
              Start Application
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Requirements;
