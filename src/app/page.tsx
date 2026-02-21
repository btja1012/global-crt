"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, Shield, Clock, Ship, Plane, Truck, Phone, MapPin, Mail } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";

const translations = {
  es: {
    badge: "20 Años de Experiencia",
    heroTitle1: "Conectando",
    heroTitle2: "El Mundo",
    heroDesc: "Global CR Transport: 20 años de excelencia en logística internacional. Soluciones premium de importación y exportación para Costa Rica y el mundo.",
    contactBtn: "Contáctenos",
    servicesBtn: "Nuestros Servicios",
    secureShipping: "Envío Seguro",
    globalReach: "Alcance Global",
    support: "Soporte 24/7",
    freightLabel: "Transporte Marítimo",
    freightSub: "Servicio confiable de carga",
    yearsLabel: "Años en el mercado",
    servicesTitle: "Nuestros Servicios",
    servicesDesc: "Soluciones logísticas integrales adaptadas a sus necesidades.",
    services: [
      { title: "Transporte Marítimo", desc: "Servicio eficiente y económico para grandes volúmenes de carga por vía marítima." },
      { title: "Transporte Aéreo", desc: "Envíos rápidos y confiables para mercancía que requiere entrega urgente." },
      { title: "Transporte Terrestre", desc: "Conexión terrestre desde puertos hasta el destino final en Costa Rica y Centroamérica." },
    ],
    whyTitle: "¿Por Qué Elegirnos?",
    stats: [
      { value: "20+", label: "Años de experiencia" },
      { value: "5000+", label: "Cargas transportadas" },
      { value: "50+", label: "Países conectados" },
      { value: "24/7", label: "Soporte al cliente" },
    ],
    footerDesc: "Su socio de confianza en logística internacional y transporte de carga. 20 años de experiencia.",
    footerServices: "Servicios",
    footerServicesList: ["Transporte Marítimo", "Transporte Aéreo", "Despacho Aduanal", "Almacenaje"],
    footerContact: "Contacto",
    footerRights: "Todos los derechos reservados",
  },
  en: {
    badge: "20 Years of Experience",
    heroTitle1: "Connecting",
    heroTitle2: "The World",
    heroDesc: "Global CR Transport: 20 years of excellence in international logistics. Premium import and export solutions for Costa Rica and the world.",
    contactBtn: "Contact Us",
    servicesBtn: "Our Services",
    secureShipping: "Secure Shipping",
    globalReach: "Global Reach",
    support: "24/7 Support",
    freightLabel: "Maritime Freight",
    freightSub: "Reliable cargo service",
    yearsLabel: "Years in the market",
    servicesTitle: "Our Services",
    servicesDesc: "Comprehensive logistics solutions tailored to your needs.",
    services: [
      { title: "Maritime Freight", desc: "Efficient and cost-effective service for large cargo volumes by sea." },
      { title: "Air Freight", desc: "Fast and reliable shipments for goods that require urgent delivery." },
      { title: "Ground Transport", desc: "Inland connection from ports to the final destination in Costa Rica and Central America." },
    ],
    whyTitle: "Why Choose Us?",
    stats: [
      { value: "20+", label: "Years of experience" },
      { value: "5000+", label: "Shipments handled" },
      { value: "50+", label: "Connected countries" },
      { value: "24/7", label: "Customer support" },
    ],
    footerDesc: "Your trusted partner in international logistics and cargo transportation. 20 years of experience.",
    footerServices: "Services",
    footerServicesList: ["Maritime Freight", "Air Freight", "Customs Clearance", "Warehousing"],
    footerContact: "Contact",
    footerRights: "All rights reserved",
  },
};

export default function HomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/50 -z-20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-20" />

        <div className="container px-4 md:px-6 relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-12 items-center py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5 lg:gap-6 text-center lg:text-left items-center lg:items-start"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full w-fit">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">{t.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              {t.heroTitle1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {t.heroTitle2}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {t.heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a href="https://wa.me/50683996456" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 h-12 px-6 text-base font-semibold w-full sm:w-auto" data-testid="button-whatsapp-hero">
                  <SiWhatsapp className="w-5 h-5 text-green-500" />
                  {t.contactBtn}
                </Button>
              </a>
              <a href="#services" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="h-12 px-6 text-base font-semibold w-full sm:w-auto" data-testid="button-services">
                  {t.servicesBtn}
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-1 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{t.secureShipping}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{t.globalReach}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{t.support}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 ease-out">
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center">
                <Ship className="w-32 h-32 text-primary/30" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-lg">{t.freightLabel}</p>
                <p className="text-white/80 text-sm">{t.freightSub}</p>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 bg-card p-6 rounded-xl shadow-xl border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">20+</p>
                  <p className="text-sm text-muted-foreground">{t.yearsLabel}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-secondary/30 scroll-mt-16">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">{t.servicesTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t.servicesDesc}</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
            {[Ship, Plane, Truck].map((Icon, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-5">
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{t.services[i].title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{t.services[i].desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">{t.whyTitle}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {t.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="p-4 md:p-6 text-center hover:shadow-md transition-shadow">
                  <p className="text-2xl md:text-4xl font-bold text-primary mb-1 md:mb-2">{stat.value}</p>
                  <p className="text-muted-foreground text-xs md:text-sm">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-foreground text-background py-12">
        <div className="container max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="col-span-1 sm:col-span-2 flex flex-col items-center sm:items-start">
            <h3 className="text-xl md:text-2xl font-display font-bold mb-4">Global CR Transport</h3>
            <p className="text-white/60 max-w-xs text-sm md:text-base">{t.footerDesc}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-primary">{t.footerServices}</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              {t.footerServicesList.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-primary">{t.footerContact}</h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li className="flex items-center gap-2 justify-center sm:justify-start">
                <MapPin className="w-4 h-4 flex-shrink-0" /> San José, Costa Rica
              </li>
              <li className="flex items-center gap-2 justify-center sm:justify-start">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">operaciones@global-crt.com</span>
              </li>
              <li className="flex items-center gap-2 justify-center sm:justify-start">
                <Phone className="w-4 h-4 flex-shrink-0" /> +506 8399-6456
              </li>
            </ul>
          </div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-xs md:text-sm">
          © {new Date().getFullYear()} Global CR Transport. {t.footerRights}. | global-crt.com
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/50683996456"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all"
        data-testid="button-whatsapp-float"
      >
        <SiWhatsapp className="w-5 h-5 md:w-6 md:h-6" />
      </a>
    </div>
  );
}
