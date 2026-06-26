import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

const Apply = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/", { replace: true }), 1500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <Layout>
      <SEOHead
        title="Visa Applications"
        description="Public online visa applications are currently unavailable. Please contact the Embassy of Bosnia and Herzegovina for assistance."
        canonical="/apply"
      />
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Visa Applications</h1>
          <h2 className="text-lg font-semibold text-muted-foreground mb-6">Service Status</h2>
          <p className="text-base text-muted-foreground mb-4">
            Online public applications are currently unavailable. Please contact Our Embassy directly
            for visa guidance and submission instructions.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting you to the homepage…</p>
        </div>
      </section>
    </Layout>
  );
};

export default Apply;
