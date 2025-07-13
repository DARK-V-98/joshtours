
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Star, Shield, Clock, Users, Car, Zap, CheckCircle } from "lucide-react";
import Image from "next/image";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(https://placehold.co/1920x1080.png)` }}
          data-ai-hint="dark luxury car"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge variant="secondary" className="w-fit text-primary border-primary/20">
              Trusted Car Rental Service
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Drive Your
              <span className="text-primary block">Dreams</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg">
              Experience comfort and reliability with our diverse fleet of vehicles. 
              From economy cars to SUVs, we have the perfect ride for every journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group">
                <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Book Instantly
              </Button>
              <Button variant="secondary" size="lg">
                View Fleet
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Quality Cars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Josh Rent a Car?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide exceptional service with reliable vehicles and outstanding customer support
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                icon: Users,
                title: "Expert Team",
                description: "Professional staff dedicated to exceptional customer service"
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
      <section id="fleet" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Quality Fleet</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our carefully selected collection of reliable and comfortable vehicles
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: "https://placehold.co/600x400.png",
                dataAiHint: "red sports car",
                category: "Sports Car",
                name: "Sports Coupe",
                price: "$199/day",
                features: ["Powerful Engine", "Sporty Design", "Comfortable Interior", "Modern Tech"]
              },
              {
                image: "https://placehold.co/600x400.png",
                dataAiHint: "black suv",
                category: "Family SUV",
                name: "Spacious SUV",
                price: "$129/day",
                features: ["7 Seats", "All-Wheel Drive", "Ample Storage", "Safety Features"]
              },
              {
                image: "https://placehold.co/600x400.png",
                dataAiHint: "white sedan",
                category: "Economy",
                name: "Comfort Sedan",
                price: "$89/day",
                features: ["Great Comfort", "Fuel Efficient", "Smooth Ride", "Safety First"]
              }
            ].map((car, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card border-border">
                <div className="relative overflow-hidden h-48">
                  <Image 
                    src={car.image} 
                    alt={car.name}
                    fill
                    data-ai-hint={car.dataAiHint}
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {car.category}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {car.name}
                    <span className="text-primary font-bold">{car.price}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {car.features.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full">
                    Book This Car
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Special Offers & Deals
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Save big with our current promotions and limited-time offers
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-background/90 border-primary/20 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-primary">Weekend Special</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">20% OFF</div>
                  <p className="text-muted-foreground">Friday to Sunday rentals</p>
                </CardContent>
              </Card>
              
              <Card className="bg-background/90 border-primary/20 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-primary">Weekly Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">7th Day</div>
                  <p className="text-muted-foreground">Completely FREE</p>
                </CardContent>
              </Card>
              
              <Card className="bg-background/90 border-primary/20 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-primary">First Timer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">15% OFF</div>
                  <p className="text-muted-foreground">Your first rental with us</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                <Phone className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Call Now: +1 (555) 123-4567
              </Button>
              <Button variant="secondary" size="lg">
                Book Online
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real experiences from real customers who chose Josh Rent a Car
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                rating: 5,
                comment: "Amazing service! The car was clean, reliable, and the booking process was so easy. Highly recommend!",
                location: "New York"
              },
              {
                name: "Mike Chen",
                rating: 5,
                comment: "Great prices and excellent customer service. The team went above and beyond to help me find the perfect car.",
                location: "California"
              },
              {
                name: "Emily Davis",
                rating: 5,
                comment: "Best car rental experience I've ever had. Professional, friendly, and incredibly convenient. Will definitely use again!",
                location: "Texas"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

    