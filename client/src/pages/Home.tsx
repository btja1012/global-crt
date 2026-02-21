import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Globe, Shield, Clock, ArrowRight, Ship, Plane, Truck } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";

export default function Home() {
  const [lang, setLang] = useState<'en' | 'es'>('es');
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
      <Navigation lang={lang} setLang={setLang} />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/50622222222"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="WhatsApp Support"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.623 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

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

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              {lang === 'en' ? 'Connecting' : 'Conectando'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {lang === 'en' ? 'The World' : 'El Mundo'}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {lang === 'en' 
                ? "Global CR Transport: 20 years of excellence. Premium logistics solutions for Costa Rica and beyond. We handle your cargo with precision, care, and speed."
                : "Global CR Transport: 20 años de excelencia. Soluciones logísticas premium para Costa Rica y el mundo. Manejamos su carga con precisión, cuidado y rapidez."
              }
            </p>

            {/* Tracking Card */}
            <Card className="p-2 mt-4 shadow-2xl shadow-primary/10 border-primary/10 bg-card/80 backdrop-blur-sm">
              <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    placeholder={lang === 'en' ? "Enter Tracking Number..." : "Ingrese número de guía..."} 
                    className="pl-10 h-12 md:h-14 text-base md:text-lg border-transparent focus:ring-0 bg-transparent"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <Button size="lg" className="h-12 md:h-14 px-8 text-base md:text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 w-full sm:w-auto">
                  {lang === 'en' ? 'Track' : 'Rastrear'}
                </Button>
              </form>
            </Card>

            <div className="flex flex-wrap gap-4 pt-4 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>{lang === 'en' ? 'Secure Shipping' : 'Envío Seguro'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>{lang === 'en' ? 'Global Reach' : 'Alcance Global'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{lang === 'en' ? '24/7 Support' : 'Soporte 24/7'}</span>
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
                  <p className="text-2xl font-bold">20</p>
                  <p className="text-sm text-muted-foreground">{lang === 'en' ? 'Years in Market' : 'Años en el Mercado'}</p>
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{lang === 'en' ? 'Our Services' : 'Nuestros Servicios'}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {lang === 'en' 
                ? 'We provide comprehensive logistics solutions tailored to your needs.'
                : 'Brindamos soluciones logísticas integrales adaptadas a sus necesidades.'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Ship, 
                title: lang === 'en' ? "Ocean Freight" : "Flete Marítimo", 
                desc: lang === 'en' 
                  ? "Efficient and cost-effective sea transport for large cargo volumes."
                  : "Transporte marítimo eficiente y rentable para grandes volúmenes de carga." 
              },
              { 
                icon: Plane, 
                title: lang === 'en' ? "Air Freight" : "Flete Aéreo", 
                desc: lang === 'en'
                  ? "Fast and reliable air transport for time-sensitive shipments."
                  : "Transporte aéreo rápido y confiable para envíos urgentes." 
              },
              { 
                icon: Truck, 
                title: lang === 'en' ? "Land Transport" : "Transporte Terrestre", 
                desc: lang === 'en'
                  ? "Seamless ground transportation connecting ports to final destinations."
                  : "Transporte terrestre sin interrupciones que conecta puertos con destinos finales." 
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
        <div className="container max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="col-span-1 sm:col-span-2 flex flex-col items-center sm:items-start">
            <h3 className="text-2xl font-display font-bold mb-4">Global CR Transport</h3>
            <p className="text-white/60 max-w-xs">
              {lang === 'en' 
                ? 'Your trusted partner in international logistics and freight forwarding. 20 years of experience.' 
                : 'Su socio de confianza en logística internacional y transporte de carga. 20 años de experiencia.'
              }
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
