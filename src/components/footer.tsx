
import { Mail, MapPin, Phone, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/">
                <Image src="/jtr.png" alt="Josh's Car Rental Logo" width={100} height={100} className="rounded-full" />
              </Link>
            </div>
            <p className="text-muted-foreground mb-4">
              Your trusted partner for reliable car rentals. Experience comfort, convenience, and great value.
            </p>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-primary fill-primary" />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <span>info@joshsrental.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>123 Main St, Anytown, USA 12345</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link href="/cars" className="block text-muted-foreground hover:text-primary transition-colors">Our Fleet</Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Business Hours</h4>
            <div className="space-y-2 text-muted-foreground">
              <div>Monday - Friday: 8:00 AM - 8:00 PM</div>
              <div>Saturday: 9:00 AM - 6:00 PM</div>
              <div>Sunday: 10:00 AM - 4:00 PM</div>
              <div className="text-primary font-semibold">24/7 Emergency Support</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Josh's Car Rental. All rights reserved. | Reliable Car Rental Service
          </p>
        </div>
      </div>
    </footer>
  );
}
