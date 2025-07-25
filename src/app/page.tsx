
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Star, Shield, Clock, Users, Car, Zap, CheckCircle } from "lucide-react";
import Image from "next/image";
import { getFeaturedCars } from "@/lib/data";
import Link from "next/link";
import { CarCard } from "@/components/car-card";
import { getApprovedTestimonials, Testimonial } from "@/lib/testimonialActions";

export default async function Index() {

  const featuredCars = await getFeaturedCars();
  const testimonials = await getApprovedTestimonials();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section id="home" className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        
        <div className="relative container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center z-20">
          <div className="space-y-8 text-center lg:text-left">
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-primary [text-shadow:0_0_2px_#fff,0_0_4px_#fff,0_0_6px_#fff]">
              <span className="animate-pulse">JOSH</span> <span className="animate-pulse">TOURS</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Experience comfort and reliability with our diverse fleet of vehicles. 
              From economy cars to SUVs, we have the perfect ride for every journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="group" asChild>
                <Link href="/cars">
                  <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Book Instantly
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/cars">View Vehicles</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
          <div className="relative mt-8 lg:mt-0 lg:block min-h-[300px] lg:min-h-[700px]">
             <div className="absolute inset-0 bg-card/10 backdrop-blur-sm rounded-3xl -rotate-6 transform"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/car1.png"
                  alt="Hero Car"
                  width={1400}
                  height={875}
                  className="object-contain z-10"
                  priority
                />
             </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose JOSH TOURS?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide exceptional service with reliable vehicles and outstanding customer support
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Fully Insured",
                description: "Complete coverage for peace of mind during your rental period"
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description: "Round-the-clock assistance whenever you need help"
              },
              {
                icon: Star,
                title: "Quality Vehicles",
                description: "Well-maintained, reliable vehicles for the best experience"
              }
            ].map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-background border-border">
                <CardHeader className="text-center">
                  <service.icon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-pulse" />
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="vehicles" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Quality Vehicles</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our carefully selected collection of reliable and comfortable vehicles
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/cars">View All Vehicles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real experiences from real customers who chose JOSH TOURS
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-card border-border hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                    ))}
                     {[...Array(5 - testimonial.rating)].map((_, i) => (
                        <Star key={i + testimonial.rating} className="h-5 w-5 text-muted-foreground/50" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))
            ) : (
                <p className="text-muted-foreground text-center col-span-full">No testimonials yet. Be the first to share your experience!</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
