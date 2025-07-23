
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
                <div className="relative h-14 w-14">
                  <Image src="/jtr.png" alt="JOSH TOURS Logo" fill className="rounded-full object-cover" />
                </div>
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
                <span>+94 70 120 9694</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <span>info@joshtours.com</span>
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
              <Link href="/cars" className="block text-muted-foreground hover:text-primary transition-colors">Our Vehicles</Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Business Hours</h4>
            <div className="space-y-2 text-muted-foreground">
              <div>Open 24 hours</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground leading-relaxed">
            © <span className="text-foreground">{new Date().getFullYear()}</span> JOSH TOURS. All rights reserved.
            <br />
            Powered by{' '}
            <a href="https://www.esystemlk.xyz" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              esystemlk
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
