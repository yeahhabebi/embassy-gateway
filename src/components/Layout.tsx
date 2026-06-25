import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, Clock } from "lucide-react";
import { useState, useEffect, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import bihLogo from "@/assets/bih-logo.png";
import { useCMSContent } from "@/hooks/useCMSContent";

/** Isolated clock component – re-renders only itself every 60s */
const LiveClock = memo(() => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const update = () => {
      if (ref.current) {
        ref.current.textContent = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return <span ref={ref} />;
});
LiveClock.displayName = "LiveClock";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { get } = useCMSContent([
    "embassy_phone",
    "embassy_email",
    "embassy_address",
    "embassy_hours",
    "embassy_fax",
  ]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Consular Services" },
    { to: "/about", label: "About BiH" },
    { to: "/track", label: "Track Application" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Contact Bar */}
      <div className="bg-primary-dark text-primary-foreground text-sm py-1.5 sm:py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <a href={`tel:${get("embassy_phone", "+91-11-26147415").replace(/\s/g, '')}`} className="flex items-center gap-1 sm:gap-1.5 hover:text-accent transition-colors shrink-0">
              <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="text-xs sm:text-sm">{get("embassy_phone", "+91-11-26147415")}</span>
            </a>
            <a href={`mailto:${get("embassy_email", "info@bhiembassy.asia")}`} className="hidden sm:flex items-center gap-1.5 hover:text-accent transition-colors min-w-0">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{get("embassy_email", "info@bhiembassy.asia")}</span>
            </a>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-primary-foreground/90 font-mono text-xs sm:text-sm shrink-0">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <LiveClock />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={bihLogo} alt="BiH Emblem" className="w-12 h-12 object-contain" width={48} height={48} decoding="async" loading="eager" srcSet={`${bihLogo} 1x`} sizes="48px" />
              </div>
              <div>
                <span className="text-xl font-bold leading-tight">Embassy of Bosnia and Herzegovina</span>
                <p className="text-xs text-primary-foreground/80">New Delhi, India</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-accent text-accent-foreground font-bold"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-primary-foreground/10 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-primary-foreground/10 animate-slide-down" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors mb-1 ${
                    isActive(link.to)
                      ? "bg-accent text-accent-foreground font-bold"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1" id="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <p>Embassy of Bosnia and Herzegovina</p>
                <p className="whitespace-pre-line">{get("embassy_address", "New Delhi - 110001, India")}</p>
                <p>Email: {get("embassy_email", "info@bhiembassy.asia")}</p>
                <p>Phone: {get("embassy_phone", "+91-11-26147415")}</p>
                <p>Fax: {get("embassy_fax", "+91-11-26147415")}</p>
              </div>
            </div>

            {/* Office Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Office Hours</h3>
              <div className="space-y-2 text-sm text-primary-foreground/80 whitespace-pre-line">
                {get("embassy_hours", "Monday - Friday\n9:00 AM - 5:00 PM\n\nConsular Hours\nMonday, Wednesday, Friday\n10:00 AM - 12:00 PM")}
              </div>
            </div>

            {/* Quick Links */}
              <nav aria-label="Footer quick links">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link to="/track" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Track Application
                </Link>
                <Link to="/requirements" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Visa Requirements
                </Link>
                <Link to="/contact" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact Us
                </Link>
              </div>
              </nav>
          </div>

          <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
            <p>&copy; {new Date().getFullYear()} Embassy of Bosnia and Herzegovina, New Delhi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
