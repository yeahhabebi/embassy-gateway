import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import bihLogo from "@/assets/bih-logo.png";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
      <div className="bg-background border-b border-border text-foreground text-sm py-2">
        <div className="container mx-auto px-4 flex items-center gap-6">
          <a href="tel:+911126147415" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Phone className="h-3.5 w-3.5" />
            <span>+91-11-26147415</span>
          </a>
          <a href="mailto:info@bihembassy.asia" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Mail className="h-3.5 w-3.5" />
            <span>info@bihembassy.asia</span>
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={bihLogo} alt="BiH Emblem" className="w-12 h-12 object-contain" width={48} height={48} decoding="async" />
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
      <main className="flex-1" id="main-content">{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <p>Embassy of Bosnia and Herzegovina</p>
                <p>New Delhi - 110001, India</p>
                <p>Email: info@bihembassy.asia</p>
                <p>Phone: +91-11-26147415</p>
              </div>
            </div>

            {/* Office Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Office Hours</h3>
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <p>Monday - Friday</p>
                <p>9:00 AM - 5:00 PM</p>
                <p className="mt-4">Consular Hours</p>
                <p>Monday, Wednesday, Friday</p>
                <p>10:00 AM - 12:00 PM</p>
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
