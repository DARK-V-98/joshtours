"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/cars", label: "Cars" },
  { href: "/futures", label: "Futures" },
  { href: "/help", label: "Help" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold font-headline tracking-tighter">I-CAR</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium bg-white/80 p-1 rounded-full shadow-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary px-4 py-2 rounded-full",
                pathname === link.href ? "bg-muted text-primary" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center justify-end space-x-4">
           <Button variant="ghost" asChild>
            <Link href="/saved" className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span>Saved</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
