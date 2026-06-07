import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function NavLinks({ isMobile = false }: { isMobile?: boolean }) {
  const { isSignedIn } = useAuth();
  return (
    <nav
      className={
        isMobile ? "flex flex-col space-y-4 pt-4" : "hidden md:flex space-x-6"
      }
    >
      <Link
        href="#how-it-works"
        className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
      >
        How It Works
      </Link>
      <Link
        href="#pricing"
        className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
      >
        Pricing
      </Link>

      {isSignedIn ? (
        <Link
          href="/pdfs"
          className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
        >
          Your PDF's
        </Link>
      ) : null}
    </nav>
  );
}
