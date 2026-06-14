"use client";

import { Menu, X, FileText, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import NavLinks from "./navlink";
import {
  SignInButton,
  SignOutButton,
  useAuth,
  useUser,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggler";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const isWorkspacePage = pathname?.startsWith("/workspace");

  useEffect(() => {
    if (isMenuOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  if (isWorkspacePage) return null;

  return (
    <div>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center relative">

          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-foreground flex items-center gap-2 shrink-0"
          >
            <FileText className="w-5 h-5 text-primary" />
            Docvora
          </Link>

          {/* Nav — centered on desktop */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <NavLinks />
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>

            {/* Desktop auth — UserButton when signed in, SignIn button when not */}
            <div className="hidden md:flex items-center">
              {!isSignedIn ? (
                <SignInButton>
                  <Button size="sm" className="cursor-pointer">Sign In</Button>
                </SignInButton>
              ) : (
                <UserButton />
              )}
            </div>

            {/* Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen((p) => !p)}
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div>
          {/* Backdrop */}
          <div
            onClick={closeMenu}
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 300ms ease",
            }}
          />

          {/* Drawer panel */}
          <div
            className="md:hidden fixed top-0 right-0 z-50 h-full w-[80vw] max-w-xs bg-background flex flex-col shadow-2xl"
            style={{
              transform: isVisible ? "translateX(0)" : "translateX(100%)",
              transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-2 font-bold text-foreground"
              >
                <FileText className="w-5 h-5 text-primary" />
                Docvora
              </Link>
              <Button variant="ghost" size="icon" onClick={closeMenu} aria-label="Close menu">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* User profile card */}
            {isSignedIn && user && (
              <div className="mx-4 mt-5 mb-1 flex items-center gap-3 bg-muted rounded-xl px-4 py-3">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName ?? "User"}
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-primary/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {user.firstName?.[0] ?? "U"}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.fullName ?? user.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="px-4 mt-4 flex-1 overflow-y-auto">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                Navigation
              </p>
              <NavLinks isMobile onLinkClick={closeMenu} />
            </div>

            {/* Bottom section */}
            <div className="px-4 pb-6 pt-4 border-t border-border flex flex-col gap-3 shrink-0">
              {/* Appearance */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Appearance</span>
                <ThemeToggle />
              </div>

              {/* Auth actions */}
              <div className="flex flex-col gap-2 pt-1">
                {!isSignedIn ? (
                  <div className="flex flex-col gap-2">
                    <SignInButton>
                      <Button variant="outline" className="w-full cursor-pointer">
                        Sign In
                      </Button>
                    </SignInButton>
                    <a href="/dashboard">
                      <Button className="w-full" onClick={closeMenu}>
                        Get Started
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <a href="/workspace" onClick={closeMenu}>
                      <Button variant="outline" className="w-full gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Go to Workspace
                      </Button>
                    </a>

                    {/* Sign out with confirmation dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sign out?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You'll need to sign in again to access your PDFs and dashboard.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <SignOutButton>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Sign Out
                            </AlertDialogAction>
                          </SignOutButton>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}