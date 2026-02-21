import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Globe, Shield, Clock, ArrowRight, Ship, Plane, Truck } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [, setLocation] = useLocation();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setLocation(`/track/${trackingNumber.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center min-h-[90vh] overflow-hidden pt-16">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/50 -z-20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-20" />
        
        {/* World Map Background (Abstract) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-center bg-no-repeat bg-cover" />

        <div className="container px-4 md:px-6 relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text & Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full w-fit">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-sm font-semibold tracking-wide uppercase">Global Logistics Leader</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Connecting <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                The World
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Premium logistics solutions for Costa Rica and beyond. 
              We handle your cargo with precision, care, and speed.
            </p>

            {/* Tracking Card */}
            <Card className="p-2 mt-4 shadow-2xl shadow-primary/10 border-primary/10 bg-card/80 backdrop-blur-sm">
              <form onSubmit={handleTrack} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    placeholder="Enter Tracking Number..." 
                    className="pl-10 h-14 text-lg border-transparent focus:ring-0 bg-transparent"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40">
                  Track
                </Button>
              </form>
            </Card>

            <div className="flex gap-4 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Secure Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>Global Reach</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            {/* Unsplash image: Cargo Ship */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 ease-out">
              {/* cargo ship container logistics */}
              <img 
                src="https://pixabay.com/get/g820366c40724f40ac0b5dd5ebb2aaef3ba38051c951a0ea15411d206179546d5f6be3dc7677344cec61c70d8aaf920479733284e64678950cd6061ed1bfe94be_1280.jpg" 
                alt="Global Logistics"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-lg">Sea Freight</p>
                <p className="text-white/80 text-sm">Reliable ocean transport</p>
              </div>
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 -left-8 bg-card p-6 rounded-xl shadow-xl border animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <ArrowRight className="w-6 h-6 -rotate-45" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12k+</p>
                  <p className="text-sm text-muted-foreground">Successful Deliveries</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive logistics solutions tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Ship, 
                title: "Ocean Freight", 
                desc: "Efficient and cost-effective sea transport for large cargo volumes." 
              },
              { 
                icon: Plane, 
                title: "Air Freight", 
                desc: "Fast and reliable air transport for time-sensitive shipments." 
              },
              { 
                icon: Truck, 
                title: "Land Transport", 
                desc: "Seamless ground transportation connecting ports to final destinations." 
              },
            ].map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-display font-bold mb-4">Global CR Transport</h3>
            <p className="text-white/60 max-w-xs">
              Your trusted partner in international logistics and freight forwarding.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-primary">Services</h4>
            <ul className="space-y-2 text-white/60">
              <li>Ocean Freight</li>
              <li>Air Freight</li>
              <li>Customs Clearance</li>
              <li>Warehousing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-primary">Contact</h4>
            <ul className="space-y-2 text-white/60">
              <li>San José, Costa Rica</li>
              <li>info@globalcr.com</li>
              <li>+506 2222-2222</li>
            </ul>
          </div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          © {new Date().getFullYear()} Global CR Transport. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
