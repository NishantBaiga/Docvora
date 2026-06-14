import {
  FileText,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Shield,
  Lock,
  Globe,
  Award,
} from "lucide-react";

const productLinks = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "API Documentation", href: "/api-docs" },
  { name: "Changelog", href: "/changelog" },
  { name: "Status", href: "/status" },
];

const solutionsLinks = [
  { name: "For Enterprises", href: "/solutions/enterprise" },
  { name: "For Startups", href: "/solutions/startups" },
  { name: "For Education", href: "/solutions/education" },
  { name: "For Legal", href: "/solutions/legal" },
  { name: "For Research", href: "/solutions/research" },
  { name: "Case Studies", href: "/case-studies" },
];

const resourceLinks = [
  { name: "Documentation", href: "/docs" },
  { name: "Help Center", href: "/help" },
  { name: "Community", href: "/community" },
  { name: "Blog", href: "/blog" },
  { name: "Webinars", href: "/webinars" },
  { name: "Whitepapers", href: "/whitepapers" },
];

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Press Kit", href: "/press" },
  { name: "Partners", href: "/partners" },
  { name: "Contact", href: "/contact" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Data Processing", href: "/data-processing" },
  { name: "Security", href: "/security" },
  { name: "Compliance", href: "/compliance" },
  { name: "Subprocessors", href: "/subprocessors" },
];

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { name: "GitHub", href: "https://github.com", icon: Github },
];

const badges = [
  { icon: Shield, color: "text-green-500", label: "SOC 2 Type II Compliant" },
  { icon: Globe, color: "text-blue-500", label: "GDPR Compliant" },
  { icon: Lock, color: "text-purple-500", label: "HIPAA Ready" },
  { icon: Award, color: "text-yellow-500", label: "ISO 27001 Certified" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Docvora</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed">
              Advanced AI-powered document summarization for enterprises.
              Transform complex documents into actionable insights with
              enterprise-grade security and scalability.
            </p>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a
                  href="mailto:sales@aisummarizer.com"
                  className="hover:text-foreground transition-colors"
                >
                  sales@aisummarizer.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a
                  href="tel:+15550000000"
                  className="hover:text-foreground transition-colors"
                >
                  +1 (555) ENTERPRISE
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: "Product", links: productLinks },
            { title: "Solutions", links: solutionsLinks },
            { title: "Resources", links: resourceLinks },
            { title: "Company", links: companyLinks },
          ].map(({ title, links }) => (
            <div key={title}>
              <h3 className="font-semibold text-foreground mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <div className="text-muted-foreground text-sm">
                © {currentYear} Docvora. All rights reserved.
              </div>
              <div className="flex flex-wrap gap-4">
                {legalLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/70 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Compliance badges */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-8 pt-6 border-t border-border">
            {badges.map(({ icon: Icon, color, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className={`w-4 h-4 ${color}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;