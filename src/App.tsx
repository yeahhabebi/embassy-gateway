import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, Component, type ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";

const Index = lazy(() => import("./pages/Index"));
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Requirements = lazy(() => import("./pages/Requirements"));
const Contact = lazy(() => import("./pages/Contact"));
const Apply = lazy(() => import("./pages/Apply"));
const Track = lazy(() => import("./pages/Track"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DnsSetup = lazy(() => import("./pages/DnsSetup"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminResetPassword = lazy(() => import("./pages/admin/ResetPassword"));

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const Applications = lazy(() => import("./pages/admin/Applications"));
const ContactMessages = lazy(() => import("./pages/admin/ContactMessages"));
const CMS = lazy(() => import("./pages/admin/CMS"));
const SeoCheck = lazy(() => import("./pages/admin/SeoCheck"));

const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute").then(m => ({ default: m.ProtectedRoute })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Error boundary to handle lazy loading failures (stale chunks after deploy)
class LazyErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // Reload the page to fetch fresh chunks
    window.location.reload();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={null}>
        <LazyErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/requirements" element={<Requirements />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/track" element={<Track />} />
            <Route path="/dns-setup" element={<ProtectedRoute><DnsSetup /></ProtectedRoute>} />

            {/* Admin Routes */}
            
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="applications" element={<Applications />} />
              <Route path="contact-messages" element={<ContactMessages />} />
              <Route path="cms" element={<CMS />} />
              <Route path="seo-check" element={<SeoCheck />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </LazyErrorBoundary>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
