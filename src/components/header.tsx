
"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Phone, User as UserIcon, LogOut, LayoutDashboard, Globe, Notebook } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { app } from "@/lib/firebase";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import React, { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Vehicles" },
  { href: "/contact", label: "Contact" },
];

const loggedInNavLinks = [
    ...navLinks,
    { href: "/my-bookings", label: "My Bookings" },
]

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const auth = app ? getAuth(app) : null;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    const name = user?.displayName;
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const currentNavLinks = user ? loggedInNavLinks : navLinks;

  const renderAuthSection = () => {
    if (loading || !isMounted) {
      return <Skeleton className="h-10 w-24 rounded-md" />;
    }
    
    if (user) {
      return (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || 'My Account'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings">
                    <Notebook className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                </DropdownMenuItem>
              {user.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      )
    } else {
      return (
         <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
      )
    }
  }


  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-10 w-10">
                <Image src="/jtr.png" alt="JOSH TOURS Logo" fill className="rounded-full object-cover" />
              </div>
            </Link>
        </div>
        
        <nav className="hidden md:flex items-center justify-center space-x-6">
          {currentNavLinks.map((link) => (
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

        <div className="flex-1 flex justify-end items-center space-x-2">
          {isMounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Currency</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                  <DropdownMenuRadioItem value="usd">USD ($)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lkr">LKR (Rs)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="eur">EUR (€)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
          
          {renderAuthSection()}
        </div>
      </div>
    </header>
  );
}
