"use client";

import { Menu, X, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import NavLinks from "./navlink";
import {
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggler";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  // Hide header on mobile for workspace pages
  const isWorkspacePage = pathname?.startsWith("/workspace");

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 ${
        isWorkspacePage ? "hidden " : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 dark:text-white flex items-center"
        >
          <FileText className="w-6 h-6 mr-2 text-orange-600" />
          AI Summarizer
        </Link>

        <NavLinks />

        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggler */}
          <div className="hidden lg:block md:block">
            <ThemeToggle />
          </div>

          <div className=" p-1 rounded-md ">
            {!isSignedIn ? (
              <SignInButton>
                <Button className="cursor-pointer">Sign In</Button>
              </SignInButton>
            ) : (
              <UserButton />
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="secondary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Sheet */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 p-4 absolute w-full bg-white dark:bg-gray-900 shadow-xl">
          <NavLinks isMobile={true} />
          <div className="mt-4 flex items-center justify-between">
            <ThemeToggle />
            <a href="/dashboard" className="flex-1 ml-2">
              <Button className="w-full hover:bg-orange-600">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
