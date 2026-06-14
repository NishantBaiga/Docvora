"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

const links = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
];

interface NavLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export default function NavLinks({ isMobile = false, onLinkClick }: NavLinksProps) {
  const { isSignedIn } = useAuth();

  const allLinks = [
    ...links,
    ...(isSignedIn ? [{ href: "/pdfs", label: "Your PDFs" }] : []),
  ];

  if (isMobile) {
    return (
      <nav className="flex flex-col">
        {allLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className="flex items-center py-3.5 px-1 text-base font-medium text-foreground border-b border-border/50 last:border-0 hover:text-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-8">
      {allLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-muted-foreground hover:text-primary font-medium transition-colors text-sm"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}