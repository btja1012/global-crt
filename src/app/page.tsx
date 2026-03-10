"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Globe, Shield, Clock, Ship, Plane, Truck, Phone, MapPin, Mail,
  CheckCircle, Users, Package, Star, FileCheck, Headphones, Award, ArrowRight,
} from "lucide-react";
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

    // Services
    servicesTitle: "Nuestros Servicios",
    servicesDesc: "Soluciones logísticas integrales adaptadas a cada necesidad, respaldadas por dos décadas de experiencia.",
    services: [
      {
        title: "Transporte Marítimo",
        desc: "Servicio eficiente y económico para grandes volúmenes de carga por vía marítima. Manejamos contenedores FCL y LCL con rutas directas a los principales puertos del mundo.",
        features: [
          "Contenedores FCL y LCL",
          "Seguimiento en tiempo real",
          "Despacho aduanal incluido",
          "Cobertura de seguro de carga",
          "Rutas: Asia, Europa, EE.UU.",
        ],
      },
      {
        title: "Transporte Aéreo",
        desc: "Envíos rápidos y confiables para mercancía que requiere entrega urgente. La opción ideal cuando el tiempo es crítico para su negocio.",
        features: [
          "Entregas express en 24-72 h",
          "Manejo de carga especial",
          "Temperatura controlada",
          "Documentación y permisos",
          "Conexión con más de 50 aeropuertos",
        ],
      },
      {
        title: "Transporte Terrestre",
        desc: "Conexión terrestre desde puertos hasta el destino final en Costa Rica y Centroamérica. Flota propia con conductores certificados.",
        features: [
          "Distribución puerta a puerta",
          "Flota refrigerada disponible",
          "Cobertura en Centroamérica",
          "GPS y monitoreo 24/7",
          "Carga sobredimensionada",
        ],
      },
      {
        title: "Despacho Aduanal",
        desc: "Gestión completa de trámites aduanales para importación y exportación. Agentes certificados que garantizan el cumplimiento normativo.",
        features: [
          "Regímenes de importación y exportación",
          "Zonas francas y depósito fiscal",
          "Gestión de permisos SENASA/CFIA",
          "Clasificación arancelaria",
          "Asesoría en regulaciones",
        ],
      },
      {
        title: "Almacenaje y Distribución",
        desc: "Bodegas estratégicamente ubicadas en Costa Rica para el almacenamiento seguro de su mercancía antes de la distribución final.",
        features: [
          "Bodega de 2,000 m²",
          "Sistema WMS de inventario",
          "Picking y packing",
          "Almacén refrigerado",
          "Cross-docking",
        ],
      },
      {
        title: "Consultoría Logística",
        desc: "Asesoramos su cadena de suministro para reducir costos y tiempos. Diseñamos la solución logística ideal para su empresa.",
        features: [
          "Análisis de cadena de suministro",
          "Optimización de rutas",
          "Negociación de tarifas navieras",
          "Estrategia de importación",
          "Capacitación a equipos",
        ],
      },
    ],
    learnMore: "Cotizar ahora",

    // Track record
    trackTitle: "Nuestra Trayectoria",
    trackDesc: "Dos décadas construyendo relaciones de confianza y entregando resultados.",
    metrics: [
      { value: "500+", label: "Clientes satisfechos", icon: "users" },
      { value: "5,000+", label: "Cargas entregadas", icon: "package" },
      { value: "50+", label: "Países conectados", icon: "globe" },
      { value: "20+", label: "Años de experiencia", icon: "award" },
      { value: "98%", label: "Satisfacción del cliente", icon: "star" },
      { value: "24/7", label: "Soporte disponible", icon: "headphones" },
    ],

    // Process
    processTitle: "¿Cómo Trabajamos?",
    processDesc: "Un proceso simple, transparente y eficiente de principio a fin.",
    steps: [
      { num: "01", title: "Cotización", desc: "Nos contacta, analizamos su necesidad y le enviamos una propuesta personalizada en menos de 24 horas." },
      { num: "02", title: "Coordinación", desc: "Nuestro equipo gestiona toda la documentación, reservas y permisos necesarios para su carga." },
      { num: "03", title: "Transporte", desc: "Su mercancía es transportada con seguimiento en tiempo real y comunicación constante." },
      { num: "04", title: "Entrega", desc: "Recibe su carga en el destino acordado, con toda la documentación en regla." },
    ],

    // Why us
    whyTitle: "¿Por Qué Elegirnos?",
    whyDesc: "No somos solo un proveedor de logística — somos su socio estratégico.",
    reasons: [
      { title: "Experiencia probada", desc: "20 años en el mercado costarricense con record comprobado de entregas exitosas." },
      { title: "Equipo certificado", desc: "Agentes aduanales, operadores logísticos y conductores con certificaciones vigentes." },
      { title: "Tecnología", desc: "Sistema de rastreo en tiempo real y plataforma digital para gestionar sus envíos." },
      { title: "Precios competitivos", desc: "Tarifas transparentes sin costos ocultos, adaptadas a su volumen de operaciones." },
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

    // Services
    servicesTitle: "Our Services",
    servicesDesc: "Comprehensive logistics solutions tailored to every need, backed by two decades of experience.",
    services: [
      {
        title: "Maritime Freight",
        desc: "Efficient and cost-effective service for large cargo volumes by sea. We handle FCL and LCL containers with direct routes to major world ports.",
        features: [
          "FCL and LCL containers",
          "Real-time tracking",
          "Customs clearance included",
          "Cargo insurance coverage",
          "Routes: Asia, Europe, USA",
        ],
      },
      {
        title: "Air Freight",
        desc: "Fast and reliable shipments for goods requiring urgent delivery. The ideal option when time is critical for your business.",
        features: [
          "Express delivery in 24–72 h",
          "Special cargo handling",
          "Temperature-controlled options",
          "Documentation & permits",
          "50+ airport connections",
        ],
      },
      {
        title: "Ground Transport",
        desc: "Inland connection from ports to the final destination in Costa Rica and Central America. Own fleet with certified drivers.",
        features: [
          "Door-to-door distribution",
          "Refrigerated fleet available",
          "Central America coverage",
          "GPS & 24/7 monitoring",
          "Oversized cargo",
        ],
      },
      {
        title: "Customs Brokerage",
        desc: "Complete management of customs formalities for import and export. Certified agents ensuring regulatory compliance.",
        features: [
          "Import & export regimes",
          "Free zones & bonded warehouses",
          "SENASA/CFIA permit management",
          "Tariff classification",
          "Regulatory advisory",
        ],
      },
      {
        title: "Warehousing & Distribution",
        desc: "Strategically located warehouses in Costa Rica for the safe storage of your goods before final distribution.",
        features: [
          "2,000 m² warehouse",
          "WMS inventory system",
          "Picking & packing",
          "Refrigerated storage",
          "Cross-docking",
        ],
      },
      {
        title: "Logistics Consulting",
        desc: "We advise your supply chain to reduce costs and lead times. We design the ideal logistics solution for your company.",
        features: [
          "Supply chain analysis",
          "Route optimization",
          "Freight rate negotiation",
          "Import strategy",
          "Team training",
        ],
      },
    ],
    learnMore: "Get a quote",

    // Track record
    trackTitle: "Our Track Record",
    trackDesc: "Two decades building trust and delivering results.",
    metrics: [
      { value: "500+", label: "Satisfied clients", icon: "users" },
      { value: "5,000+", label: "Shipments delivered", icon: "package" },
      { value: "50+", label: "Connected countries", icon: "globe" },
      { value: "20+", label: "Years of experience", icon: "award" },
      { value: "98%", label: "Customer satisfaction", icon: "star" },
      { value: "24/7", label: "Support available", icon: "headphones" },
    ],

    // Process
    processTitle: "How We Work",
    processDesc: "A simple, transparent, and efficient process from start to finish.",
    steps: [
      { num: "01", title: "Quote", desc: "Contact us, we analyze your needs and send a personalized proposal in under 24 hours." },
      { num: "02", title: "Coordination", desc: "Our team handles all documentation, bookings, and permits required for your cargo." },
      { num: "03", title: "Transport", desc: "Your goods are transported with real-time tracking and constant communication." },
      { num: "04", title: "Delivery", desc: "You receive your cargo at the agreed destination with all paperwork in order." },
    ],

    // Why us
    whyTitle: "Why Choose Us?",
    whyDesc: "We're not just a logistics provider — we're your strategic partner.",
    reasons: [
      { title: "Proven experience", desc: "20 years in the Costa Rican market with a verified record of successful deliveries." },
      { title: "Certified team", desc: "Customs agents, logistics operators, and drivers with current certifications." },
      { title: "Technology", desc: "Real-time tracking system and digital platform to manage your shipments." },
      { title: "Competitive pricing", desc: "Transparent rates with no hidden costs, tailored to your volume of operations." },
    ],

    footerDesc: "Your trusted partner in international logistics and cargo transportation. 20 years of experience.",
    footerServices: "Services",
    footerServicesList: ["Maritime Freight", "Air Freight", "Customs Clearance", "Warehousing"],
    footerContact: "Contact",
    footerRights: "All rights reserved",
  },
};

const metricIconMap: Record<string, React.ReactNode> = {
  users: <Users className="w-7 h-7" />,
  package: <Package className="w-7 h-7" />,
  globe: <Globe className="w-7 h-7" />,
  award: <Award className="w-7 h-7" />,
  star: <Star className="w-7 h-7" />,
  headphones: <Headphones className="w-7 h-7" />,
};

const serviceIcons = [Ship, Plane, Truck, FileCheck, Package, Globe];

export default function HomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/50 -z-20 pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-20 pointer-events-none" />
      <Navigation />

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen pt-16">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {t.services.map((service, i) => {
              const Icon = serviceIcons[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ y: -5 }}
                  className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm hover:shadow-xl transition-all flex flex-col"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-5">
                    <Icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-5">{service.desc}</p>
                  <ul className="space-y-2 mt-auto mb-6">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="https://wa.me/50683996456" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full gap-2 text-sm font-semibold">
                      <SiWhatsapp className="w-4 h-4 text-green-500" />
                      {t.learnMore}
                    </Button>
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Track Record Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">{t.trackTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t.trackDesc}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {t.metrics.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="p-5 md:p-8 text-center hover:shadow-md transition-shadow flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    {metricIconMap[metric.icon]}
                  </div>
                  <p className="text-3xl md:text-5xl font-bold text-primary">{metric.value}</p>
                  <p className="text-muted-foreground text-xs md:text-sm font-medium">{metric.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">{t.processTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t.processDesc}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">
            {t.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl border p-6 md:p-8 h-full flex flex-col">
                  <div className="text-4xl md:text-5xl font-bold text-primary/20 mb-4 font-display">{step.num}</div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < t.steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-primary/40">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">{t.whyTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t.whyDesc}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-8">
            {t.reasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-4 bg-card rounded-2xl border p-6 md:p-8 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{reason.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 md:mt-16 text-center bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-14"
          >
            <h3 className="text-xl md:text-3xl font-bold mb-3">
              {lang === "es" ? "¿Listo para optimizar su logística?" : "Ready to optimize your logistics?"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm md:text-base">
              {lang === "es"
                ? "Contáctenos hoy y reciba una cotización personalizada sin costo ni compromiso."
                : "Contact us today and receive a personalized quote at no cost or commitment."}
            </p>
            <a href="https://wa.me/50683996456" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 h-12 px-8 text-base font-semibold">
                <SiWhatsapp className="w-5 h-5" />
                {lang === "es" ? "Escribir por WhatsApp" : "Message on WhatsApp"}
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-foreground text-background py-12">
        <div className="container max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="col-span-1 sm:col-span-2 flex flex-col items-center sm:items-start">
            <h3 className="text-xl md:text-2xl font-display font-bold mb-4">Global CR Transport</h3>
            <p className="text-background/60 max-w-xs text-sm md:text-base">{t.footerDesc}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-primary">{t.footerServices}</h4>
            <ul className="space-y-2 text-background/60 text-sm">
              {t.footerServicesList.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-primary">{t.footerContact}</h4>
            <ul className="space-y-3 text-background/60 text-sm">
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
        <div className="container max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-background/10 text-center text-background/40 text-xs md:text-sm">
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
