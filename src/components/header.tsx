
"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Car, Phone } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Fleet" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Car className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Josh's Car Rental</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-foreground/80 hover:text-primary transition-colors",
                pathname === link.href && "text-primary font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center gap-2 text-foreground">
            <Phone className="h-5 w-5 text-primary" />
            <span>+1 (555) 123-4567</span>
          </div>
          <Button asChild>
            <Link href="/cars">Book Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

    
