import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

const BASE_URL = "https://www.bihembassy.asia";

const SEOHead = ({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage = `${BASE_URL}/images/embassy-hero.jpg`,
  jsonLd,
  noindex = false,
}: SEOHeadProps) => {
  const fullTitle = title.includes("Embassy")
    ? title
    : `${title} | Embassy of Bosnia and Herzegovina in India`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="Embassy of Bosnia and Herzegovina - New Delhi" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

// Reusable JSON-LD schemas
export const embassyOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentOffice",
  name: "Embassy of Bosnia and Herzegovina in New Delhi",
  alternateName: "BiH Embassy India",
  url: "https://www.bihembassy.asia",
  logo: "https://www.bihembassy.asia/favicon.png",
  image: "https://www.bihembassy.asia/images/embassy-hero.jpg",
  description:
    "Official Embassy of Bosnia and Herzegovina in New Delhi, India. Providing consular services, visa processing, and promoting bilateral relations.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110001",
    addressCountry: "IN",
  },
  telephone: "+91-11-26147415",
  email: "info@bihembassy.com",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
  ],
  geo: {
    "@type": "GeoCoordinates",
    latitude: "28.6139",
    longitude: "77.2090",
  },
  sameAs: [],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Embassy of Bosnia and Herzegovina in New Delhi, India",
  alternateName: "BiH Embassy India",
  url: "https://www.bihembassy.asia",
  publisher: {
    "@type": "GovernmentOffice",
    name: "Embassy of Bosnia and Herzegovina in New Delhi",
  },
  inLanguage: "en",
};

export const breadcrumbSchema = (
  items: { name: string; url: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `https://www.bihembassy.asia${item.url}`,
  })),
});

export const faqSchema = (
  faqs: { question: string; answer: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const serviceSchema = (
  services: { name: string; description: string; url?: string }[]
) => services.map((service) => ({
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  name: service.name,
  description: service.description,
  serviceType: "Consular Service",
  provider: {
    "@type": "GovernmentOffice",
    name: "Embassy of Bosnia and Herzegovina in New Delhi",
    url: "https://www.bihembassy.asia",
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  ...(service.url ? { url: `https://www.bihembassy.asia${service.url}` } : {}),
}));
