import { useState, useEffect, useRef, createContext, useContext } from "react";
import "./App.css";
import axios from "axios";
import TRANSLATIONS from "./translations";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Phone, MapPin, Mail, Facebook, 
  ChevronRight, Shield, Eye, Award, Lock, Briefcase,
  FileText, Calculator, Scale, Building2, Users, 
  FileCheck, Gavel, TrendingUp, ShieldCheck, ClipboardCheck,
  Banknote, Clock, ArrowRight, MessageCircle, Globe,
  Calendar, ExternalLink, ChevronDown
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Toaster, toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Calendly URL - reemplaza con tu URL de Calendly
const CALENDLY_URL = "https://calendly.com/refmex/asesoria";

// WhatsApp configuration
const WHATSAPP_MAIN = "529612298120";
const WHATSAPP_MESSAGE = encodeURIComponent("Hola, me gustaría agendar una asesoría con REFMEX.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_MAIN}?text=${WHATSAPP_MESSAGE}`;

// Facebook URL
const FACEBOOK_URL = "https://www.facebook.com/RefmexRedDeEstudios";

// Language context
const LangContext = createContext('es');
const useT = () => {
  const lang = useContext(LangContext);
  return TRANSLATIONS[lang] || TRANSLATIONS.es;
};

// Logo URL
const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_03260dd2-d13e-48a4-92a5-b5b5239906d3/artifacts/r07q1ila_Recurso%202%402x.png";

// Image URLs
const IMAGES = {
  team: "https://images.unsplash.com/photo-1758518727401-53823b36c47b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwzfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmVzJTIwbWVldGluZyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsc3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
  building: "https://images.unsplash.com/photo-1760246964044-1384f71665b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3Jwb3JhdGUlMjBvZmZpY2UlMjBidWlsZGluZyUyMGV4dGVyaW9yfGVufDB8fHx8MTc3NTc3ODgyN3ww&ixlib=rb-4.1.0&q=85",
  values: "https://images.unsplash.com/photo-1621510007869-775c2657e580?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmVzJTIwbWVldGluZyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsc3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85"
};

// Services data with detailed descriptions
const SERVICES = [
  { 
    icon: FileText, 
    title: "Auditoría", 
    desc: "Revisión independiente de información financiera",
    fullDesc: "La auditoría es la revisión independiente de la información financiera de una empresa para verificar su veracidad y cumplimiento normativo. Para llevarla a cabo, es indispensable contar con estados financieros completos, registros contables actualizados, documentación soporte (facturas, contratos) y acceso a la información interna.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Auditoría"
  },
  { 
    icon: Calculator, 
    title: "Contabilidad", 
    desc: "Registro y control de operaciones financieras",
    fullDesc: "La contabilidad implica el registro y control de todas las operaciones financieras. Requiere comprobantes fiscales válidos, un catálogo de cuentas adecuado, sistemas contables confiables y el cumplimiento de normas vigentes para garantizar información clara y útil.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Contabilidad"
  },
  { 
    icon: Banknote, 
    title: "Impuestos", 
    desc: "Cálculo, declaración y pago de contribuciones",
    fullDesc: "Los impuestos comprenden el cálculo, declaración y pago de contribuciones. Es indispensable contar con RFC activo, e.firma vigente, registros contables correctos y cumplimiento en tiempo y forma de las obligaciones fiscales.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Impuestos"
  },
  { 
    icon: FileCheck, 
    title: "Registro REPSE", 
    desc: "Tramitación y renovación del Registro",
    fullDesc: "Tramitación y renovación del Registro de Prestadoras de Servicios Especializados u Obras Especializadas.",
    isREPSE: true,
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Registro REPSE"
  },
  { 
    icon: TrendingUp, 
    title: "Precios de Transferencia", 
    desc: "Estudios y documentación",
    fullDesc: "Los precios de transferencia regulan las operaciones entre partes relacionadas para asegurar que se realicen a valor de mercado. Se requiere documentación comprobatoria, estudios técnicos, análisis funcional y evidencia de comparabilidad conforme a la ley.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Precios de Transferencia"
  },
  { 
    icon: Scale, 
    title: "Acuerdos Conclusivos", 
    desc: "Representación ante el SAT",
    fullDesc: "Los acuerdos conclusivos son mecanismos para resolver controversias fiscales con la autoridad sin llegar a juicio. Es necesario tener una auditoría en curso, pruebas documentales suficientes y disposición para negociar bajo supervisión de la autoridad competente.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Acuerdos Conclusivos"
  },
  { 
    icon: Gavel, 
    title: "Peritajes Contables", 
    desc: "Análisis forense y dictámenes",
    fullDesc: "Los peritajes contables consisten en la emisión de una opinión técnica sobre información financiera en procesos legales. Se requiere información contable completa, documentación soporte y la intervención de un perito certificado.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Peritajes Contables"
  },
  { 
    icon: Building2, 
    title: "Planeación Estratégica", 
    desc: "Consultoría fiscal y financiera",
    fullDesc: "La planeación estratégica fiscal y financiera busca optimizar recursos y reducir riesgos. Es indispensable contar con información financiera confiable, proyecciones, análisis de riesgos y conocimiento actualizado de la legislación.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Planeación Estratégica Fiscal y Financiera"
  },
  { 
    icon: Shield, 
    title: "Defensa Penal-Fiscal", 
    desc: "Representación legal especializada",
    fullDesc: "La defensa penal-fiscal implica la representación legal ante delitos fiscales. Requiere documentación probatoria, estrategia legal sólida, cumplimiento de plazos procesales y asesoría especializada.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Defensa Penal-Fiscal"
  },
  { 
    icon: Users, 
    title: "Asesoría y Consultoría", 
    desc: "Acompañamiento profesional integral",
    fullDesc: "La asesoría y consultoría fiscal brinda orientación para el correcto cumplimiento de obligaciones. Es necesario proporcionar información veraz, documentación completa y mantener comunicación constante con el asesor.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Asesoría y Consultoría Fiscal"
  },
  { 
    icon: ShieldCheck, 
    title: "Compliance Fiscal", 
    desc: "Cumplimiento normativo tributario",
    fullDesc: "El compliance fiscal asegura que la empresa cumpla con todas sus obligaciones tributarias. Requiere controles internos, políticas claras, revisiones periódicas y actualización constante ante cambios legales.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Compliance Fiscal"
  },
  { 
    icon: ClipboardCheck, 
    title: "Compliance Laboral", 
    desc: "Verificación de obligaciones laborales",
    fullDesc: "El compliance laboral busca el cumplimiento de normas en materia de trabajo. Es indispensable contar con contratos laborales, registros de nómina, cumplimiento de prestaciones y apego a la legislación vigente.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Compliance Laboral"
  },
  { 
    icon: Lock, 
    title: "Compliance Corporativo", 
    desc: "Cumplimiento normativo empresarial",
    fullDesc: "El compliance corporativo asegura que la empresa cumpla con todas las normativas aplicables a su operación, incluyendo gobierno corporativo, prevención de riesgos y mejores prácticas empresariales.",
    whatsappMsg: "Hola, me gustaría contratar los servicios de: Compliance Corporativo"
  }
];

// REPSE Requirements
const REPSE_FISICAS = [
  "Constancia de situación fiscal",
  "Opinión (IMSS-SAT-INFONAVIT)",
  "Identificación oficial",
  "CURP",
  "Nómina en PDF",
  "Tarjeta patronal",
  "SUA (Resumen de liquidación y cédulas cuotas-obrera)",
  "Comprobante de domicilio (predial, luz, teléfono)",
  "E.firma del SAT",
  "Acuse de inscripción al RFC",
  "Folio de afiliación INFONACOT",
  "Formato 17 o 28 de REPSE"
];

const REPSE_MORALES = [
  "Acta constitutiva",
  "Poder Notarial",
  "Opinión (IMSS-SAT-INFONAVIT)",
  "Identificación oficial del Representante",
  "CURP del representante",
  "Nómina en PDF",
  "Tarjeta patronal",
  "SUA (Resumen de liquidación y cédulas cuotas-obrera)",
  "Comprobante de domicilio (predial, luz, teléfono)",
  "E.firma del SAT",
  "Constancia de situación fiscal",
  "Folio de afiliación INFONACOT",
  "Formato 17 o 28 de REPSE"
];

// Icons for values (same order as translations.values.values_list)
const VALUE_ICONS = [Shield, Eye, Award, Lock, Briefcase];

// Offices data with updated phone numbers
const OFFICES = [
  {
    name: "Sede Chiapas",
    city: "Tuxtla Gutiérrez, Chiapas",
    address: "Calle 13a. Poniente Sur 985, Chiapas",
    phones: ["961 229 8120", "961 128 9177"],
    whatsapp: "529612298120",
    maps: "https://www.google.com/maps/search/Calle%2013a.%20Poniente%20Sur%20985/@16.74809455871582,-93.12777709960938,17z?hl=es",
    embedUrl: "https://maps.google.com/maps?q=16.748094,-93.127777&output=embed&z=15&hl=es",
    image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=600&h=250&q=80",
    lat: 16.748094,
    lng: -93.127777
  },
  {
    name: "Sede Nuevo León",
    city: "Monterrey, Nuevo León",
    address: "Pino Sur 209, Valle del Virrey, CP 67257",
    phones: ["813 586 5600"],
    whatsapp: "528135865600",
    maps: "https://www.google.com/maps?q=Pino+Sur+209,+Valle+Sur,+67257+Cdad.+Benito+Ju%C3%A1rez,+N.L.",
    embedUrl: "https://maps.google.com/maps?q=Pino+Sur+209+Valle+del+Virrey+Juarez+Nuevo+Leon+67257&output=embed&z=15&hl=es",
    image: "https://images.unsplash.com/photo-1518806118471-f28b20a1d79d?auto=format&fit=crop&w=600&h=250&q=80",
    lat: 25.6749,
    lng: -100.2522
  },
  {
    name: "Sede Estado de México",
    city: "Tultitlán, Estado de México",
    address: "Valle de los Piracantos 48, Izcalli del Valle, Tultitlán, CP 54945",
    phones: ["557 500 9770"],
    whatsapp: "525575009770",
    maps: "https://www.google.com/maps/search/Valle%20de%20los%20piracantos%2048%20izcalli%20del%20valle%20tultitlan/@19.58583223,-99.18466924,17z?hl=es",
    embedUrl: "https://maps.google.com/maps?q=19.585832,-99.184669&output=embed&z=15&hl=es",
    image: "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?auto=format&fit=crop&w=600&h=250&q=80",
    lat: 19.5858,
    lng: -99.1847
  }
];

// Job positions
const JOB_POSITIONS = [
  "Contador de Impuestos",
  "Contador de Costos",
  "Nominista",
  "Trámites (SAT-IMSS-INFONAVIT-STPS)",
  "Contador Fiscal",
  "Laboralista"
];

// Languages
const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇲🇽' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

// Service Detail Modal
const ServiceModal = ({ service, isOpen, onClose }) => {
  const t = useT();
  const whatsappUrl = `https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(service.whatsappMsg)}`;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <service.icon size={24} className="text-blue-600" />
            </div>
            {service.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-slate-600 leading-relaxed mb-6">{service.fullDesc}</p>
          
          {service.isREPSE && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">{t.services.req_fisicas}</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-sm">
                  {REPSE_FISICAS.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ol>
                <p className="text-slate-500 text-sm mt-2 italic">{t.services.req_note}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">{t.services.req_morales}</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-sm">
                  {REPSE_MORALES.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ol>
                <p className="text-slate-500 text-sm mt-2 italic">{t.services.req_note}</p>
              </div>
            </div>
          )}
          
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-blue w-full mt-6 flex items-center justify-center gap-2"
            data-testid={`service-cta-${service.title.toLowerCase().replace(/\s/g, '-')}`}
          >
            <MessageCircle size={18} />
            {t.services.hire}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Navbar Component
const Navbar = ({ language, setLanguage }) => {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { setScrolled(window.scrollY > 50); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "#nosotros", label: t.nav.about },
    { href: "#servicios", label: t.nav.services },
    { href: "#bolsa-trabajo", label: t.nav.jobs },
    { href: "#blog", label: t.nav.blog },
    { href: "#contacto", label: t.nav.contact }
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav className={`navbar-fixed transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'} ${scrolled ? '' : 'navbar-dark'}`} data-testid="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a href="#hero" onClick={(e) => scrollToSection(e, '#hero')} data-testid="navbar-logo">
              <img src={LOGO_WHITE} alt="REFMEX" className={`h-10 w-auto transition-all ${scrolled ? 'brightness-0' : ''}`} />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`text-sm uppercase tracking-wider transition-colors ${scrolled ? 'text-slate-700 hover:text-blue-700' : 'text-white hover:text-blue-300'}`}
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {link.label}
                </a>
              ))}
              
              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className={`w-auto gap-2 border-0 bg-transparent ${scrolled ? 'text-slate-700' : 'text-white'}`}>
                  <Globe size={16} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-blue text-sm uppercase tracking-wider"
                data-testid="nav-cta-button"
              >
                {t.nav.cta}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`lg:hidden p-2 ${scrolled ? 'text-slate-700' : 'text-white'}`}
              onClick={() => setIsOpen(!isOpen)}
              data-testid="mobile-menu-button"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-menu lg:hidden"
            data-testid="mobile-menu"
          >
            <button
              className="absolute top-4 right-4 text-white p-2"
              onClick={() => setIsOpen(false)}
            >
              <X size={24} />
            </button>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-xl uppercase tracking-wider text-white hover:text-blue-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-blue text-lg uppercase tracking-wider mt-4"
            >
              {t.nav.cta}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hero Section
const HeroSection = () => {
  const t = useT();
  return (
    <section id="hero" className="hero-section" data-testid="hero-section">
      <div className="hero-background" style={{ backgroundImage: `url(${IMAGES.building})` }} />
      <div className="hero-overlay" />
      <div className="hero-glow top-1/4 -left-40" />
      <div className="hero-glow bottom-1/4 -right-40" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <img 
            src={LOGO_WHITE} 
            alt="REFMEX" 
            className="w-48 sm:w-64 lg:w-80 mb-8"
            data-testid="hero-logo"
          />
          
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-center mb-6 leading-tight text-white" data-testid="hero-title">
            {t.hero.title}{" "}
            <span className="text-blue-300">{t.hero.highlight}</span>
          </h1>

          <p className="text-blue-100/80 text-base sm:text-lg lg:text-xl text-center max-w-3xl mb-10" data-testid="hero-subtitle">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="#servicios"
              onClick={(e) => { e.preventDefault(); document.querySelector('#servicios').scrollIntoView({ behavior: 'smooth' }); }}
              className="btn-white flex items-center justify-center gap-2"
              data-testid="hero-services-btn"
            >
              {t.hero.btn_services}
              <ChevronRight size={18} />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-white-outline flex items-center justify-center gap-2"
              data-testid="hero-contact-btn"
            >
              {t.hero.btn_contact}
              <MessageCircle size={18} />
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0" data-testid="hero-stats">
            <div className="text-center px-8">
              <div className="text-blue-300 text-4xl sm:text-5xl font-serif font-medium">30+</div>
              <div className="text-blue-100/70 text-sm uppercase tracking-wider mt-1">{t.hero.stat_years}</div>
            </div>
            <div className="stat-divider hidden sm:block" />
            <div className="text-center px-8">
              <div className="text-blue-300 text-4xl sm:text-5xl font-serif font-medium">3</div>
              <div className="text-blue-100/70 text-sm uppercase tracking-wider mt-1">{t.hero.stat_offices}</div>
            </div>
            <div className="stat-divider hidden sm:block" />
            <div className="text-center px-8">
              <div className="text-blue-300 text-4xl sm:text-5xl font-serif font-medium">13+</div>
              <div className="text-blue-100/70 text-sm uppercase tracking-wider mt-1">{t.hero.stat_services}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// About Section with updated content
const AboutSection = () => {
  const t = useT();
  return (
    <section id="nosotros" className="section-light py-16 md:py-24 lg:py-32" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">{t.about.eyebrow}</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800" data-testid="about-title">
              {t.about.title}
            </h2>
            <p className="text-slate-500 text-lg mt-4">{t.about.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
                <p className="text-blue-800 font-medium italic">"{t.about.quote}"</p>
              </div>
              <p className="text-slate-600 leading-relaxed">{t.about.p1}</p>
              <p className="text-slate-600 leading-relaxed">{t.about.p2}</p>
              <p className="text-slate-600 leading-relaxed">{t.about.p3}</p>
              <p className="text-slate-600 leading-relaxed">{t.about.p4}</p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { icon: Clock, title: t.about.feat_exp, desc: t.about.feat_exp_desc },
                  { icon: Users, title: t.about.feat_team, desc: t.about.feat_team_desc },
                  { icon: MapPin, title: t.about.feat_presence, desc: t.about.feat_presence_desc },
                  { icon: Award, title: t.about.feat_cert, desc: t.about.feat_cert_desc }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <item.icon size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-slate-800 font-medium text-sm">{item.title}</div>
                      <div className="text-slate-500 text-xs">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image with Floating Card */}
            <div className="relative">
              <div className="overflow-hidden rounded-lg">
                <img 
                  src={IMAGES.team} 
                  alt="Equipo REFMEX" 
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                  data-testid="about-image"
                />
              </div>
              <div className="floating-card" data-testid="about-floating-card">
                <p className="font-serif text-lg font-medium">{t.about.card_title}</p>
                <p className="text-sm mt-1 opacity-90">{t.about.card_desc}</p>
              </div>
            </div>
          </div>
          
          {/* What We Do Section */}
          <div className="mt-20 bg-slate-50 p-8 rounded-lg">
            <h3 className="font-serif text-2xl text-slate-800 mb-6">{t.about.commitment_title}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <p className="text-slate-600 leading-relaxed">{t.about.commitment_p1}</p>
              <p className="text-slate-600 leading-relaxed">{t.about.commitment_p2}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Values Section with Ethics
const ValuesSection = () => {
  const t = useT();

  return (
    <section id="valores" className="section-gray py-16 md:py-24 lg:py-32 relative overflow-hidden" data-testid="values-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">{t.values.eyebrow}</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800" data-testid="values-title">
              {t.values.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {t.values.values_list.map((value, idx) => {
              const Icon = VALUE_ICONS[idx];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="card-refmex"
                  data-testid={`value-card-${idx}`}
                >
                  <div className="value-icon">
                    <Icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="font-serif text-xl text-slate-800 mb-3">{value.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{value.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Ethics Section */}
          <div className="bg-white p-8 rounded-lg border border-blue-100">
            <h3 className="font-serif text-2xl text-slate-800 mb-6 flex items-center gap-3">
              <Shield className="text-blue-600" size={28} />
              {t.values.ethics_title}
            </h3>
            <p className="text-slate-600 mb-6">{t.values.ethics_intro}</p>
            <div className="space-y-4">
              {t.values.ethics_list.map((principle, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-blue-600 font-semibold">{principle.letter})</span>
                  <div>
                    <span className="font-semibold text-slate-800">{principle.title}.</span>
                    <span className="text-slate-600 ml-1">{principle.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Services Section with Modal
const ServicesSection = () => {
  const t = useT();
  const [selectedService, setSelectedService] = useState(null);

  return (
    <section id="servicios" className="section-light py-16 md:py-24 lg:py-32 relative" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">{t.services.eyebrow}</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800" data-testid="services-title">
              {t.services.title}
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">{t.services.subtitle}</p>
          </div>

          <div className="services-grid">
            {t.services.services_list.map((svc, idx) => {
              const base = SERVICES[idx];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="card-refmex cursor-pointer group"
                  onClick={() => setSelectedService({ ...base, title: svc.title, desc: svc.desc })}
                  data-testid={`service-card-${idx}`}
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <base.icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="font-serif text-lg text-slate-800 mb-2">{svc.title}</h3>
                  <p className="text-slate-500 text-sm mb-4">{svc.desc}</p>
                  <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t.services.more} <ChevronRight size={16} />
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-blue inline-flex items-center gap-2"
              data-testid="services-cta-button"
            >
              {t.services.cta}
              <ArrowRight size={18} />
            </a>
          </div>
        </motion.div>
      </div>

      {selectedService && (
        <ServiceModal 
          service={selectedService} 
          isOpen={!!selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </section>
  );
};

// Job Application Section
const JobSection = () => {
  const t = useT();
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    puesto: '',
    grado_academico: '',
    salario_deseado: '',
    cv: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append('nombre', formData.nombre);
      form.append('edad', formData.edad);
      form.append('puesto', formData.puesto);
      form.append('grado_academico', formData.grado_academico);
      form.append('salario_deseado', formData.salario_deseado);
      if (formData.cv) {
        form.append('cv', formData.cv);
      }

      await axios.post(`${API}/applications`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(t.jobs.success, { description: t.jobs.success_desc });

      setFormData({
        nombre: '',
        edad: '',
        puesto: '',
        grado_academico: '',
        salario_deseado: '',
        cv: null
      });
    } catch (error) {
      toast.error(t.jobs.error, { description: t.jobs.error_desc });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="bolsa-trabajo" className="section-dark py-16 md:py-24 lg:py-32" data-testid="job-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-4">{t.jobs.eyebrow}</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-white" data-testid="job-title">
              {t.jobs.title}
            </h2>
            <p className="text-blue-100/70 text-lg mt-4">{t.jobs.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Content - Positions */}
            <div>
              <h3 className="font-serif text-2xl text-white mb-6">{t.jobs.positions_title}</h3>
              <div className="grid grid-cols-2 gap-4">
                {t.jobs.job_positions.map((position, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-900/30 border border-blue-500/20 p-4 rounded-lg hover:border-blue-400/40 transition-colors cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, puesto: position }))}
                  >
                    <Briefcase size={20} className="text-blue-400 mb-2" />
                    <p className="text-white text-sm font-medium">{position}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h4 className="text-white font-medium mb-4">{t.jobs.why_title}</h4>
                <ul className="space-y-3">
                  {t.jobs.why.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-blue-100/80">
                      <ChevronRight size={16} className="text-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="card-dark p-8 rounded-lg" data-testid="job-form-card">
              <h3 className="font-serif text-xl text-white mb-6">{t.jobs.form_title}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                    {t.jobs.name} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input-underline input-dark"
                    placeholder={t.jobs.name}
                    data-testid="job-input-nombre"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                      {t.jobs.age} *
                    </label>
                    <input
                      type="number"
                      required
                      min="18"
                      max="99"
                      value={formData.edad}
                      onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                      className="input-underline input-dark"
                      placeholder="Edad"
                      data-testid="job-input-edad"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                      {t.jobs.position} *
                    </label>
                    <Select
                      value={formData.puesto}
                      onValueChange={(value) => setFormData({ ...formData, puesto: value })}
                    >
                      <SelectTrigger className="bg-transparent border-0 border-b-2 border-blue-500/30 rounded-none text-white focus:ring-0 focus:border-blue-400 h-12" data-testid="job-select-puesto">
                        <SelectValue placeholder={t.jobs.position_placeholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-blue-500/30">
                        {t.jobs.job_positions.map((pos, idx) => (
                          <SelectItem key={idx} value={pos} className="text-white hover:bg-blue-600/20 focus:bg-blue-600/20">
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                    {t.jobs.degree}
                  </label>
                  <input
                    type="text"
                    value={formData.grado_academico}
                    onChange={(e) => setFormData({ ...formData, grado_academico: e.target.value })}
                    className="input-underline input-dark"
                    placeholder={t.jobs.degree_placeholder}
                    data-testid="job-input-grado"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                    {t.jobs.salary}
                  </label>
                  <input
                    type="text"
                    value={formData.salario_deseado}
                    onChange={(e) => setFormData({ ...formData, salario_deseado: e.target.value })}
                    className="input-underline input-dark"
                    placeholder={t.jobs.salary_placeholder}
                    data-testid="job-input-salario"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                    {t.jobs.cv} *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({ ...formData, cv: e.target.files[0] })}
                    className="w-full text-blue-100/70 file:mr-4 file:py-2 file:px-4 file:border file:border-blue-500/30 file:bg-transparent file:text-blue-300 file:cursor-pointer hover:file:bg-blue-500/10 file:rounded"
                    data-testid="job-input-cv"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.nombre || !formData.edad || !formData.puesto}
                  className="btn-blue w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="job-submit-button"
                >
                  {isSubmitting ? t.jobs.submitting : t.jobs.submit}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Blog Section
const BlogSection = () => {
  const t = useT();
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('empresarios');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`${API}/blog`);
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(a => a.category === activeCategory);

  const categories = [
    { id: 'empresarios', label: t.blog.tabs.empresarios },
    { id: 'fiscalistas', label: t.blog.tabs.fiscalistas },
    { id: 'asalariados', label: t.blog.tabs.asalariados }
  ];

  return (
    <section id="blog" className="section-gray py-16 md:py-24 lg:py-32" data-testid="blog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">{t.blog.eyebrow}</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800" data-testid="blog-title">
              {t.blog.title}
            </h2>
            <p className="text-slate-500 text-lg mt-4">{t.blog.subtitle}</p>
          </div>

          <Tabs defaultValue="empresarios" className="w-full" onValueChange={setActiveCategory}>
            <TabsList className="flex justify-center gap-2 mb-12 bg-transparent">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="blog-tab data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-700 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:border-transparent"
                  data-testid={`blog-tab-${cat.id}`}
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article, idx) => (
                    <motion.div
                      key={`${article.id}-${activeCategory}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.2) }}
                      className="card-refmex overflow-hidden p-0"
                      data-testid={`blog-article-${idx}`}
                    >
                      <div className="overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="blog-card-image"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs uppercase tracking-wider text-blue-600">
                            {article.read_time} lectura
                          </span>
                        </div>
                        <h3 className="font-serif text-lg text-slate-800 mb-2">{article.title}</h3>
                        <p className="text-slate-500 text-sm">{article.excerpt}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="text-center mt-12">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-blue inline-flex items-center gap-2"
              data-testid="blog-cta-button"
            >
              {t.blog.cta}
              <ArrowRight size={18} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Leaflet map with REFMEX markers — lazy loaded to avoid SSR issues
let MapContainer, TileLayer, Marker, Popup, LeafletL;

const loadLeaflet = async () => {
  if (MapContainer) return;
  const leaflet = await import('leaflet');
  const rl = await import('react-leaflet');
  await import('leaflet/dist/leaflet.css');
  LeafletL = leaflet.default;
  MapContainer = rl.MapContainer;
  TileLayer = rl.TileLayer;
  Marker = rl.Marker;
  Popup = rl.Popup;
  delete LeafletL.Icon.Default.prototype._getIconUrl;
  LeafletL.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

const OfficesMap = () => {
  const [ready, setReady] = useState(false);
  const iconRef = useRef(null);

  useEffect(() => {
    loadLeaflet().then(() => {
      iconRef.current = LeafletL.divIcon({
        html: `<div style="width:38px;height:38px;background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
          <img src="${LOGO_WHITE}" style="transform:rotate(45deg);width:22px;height:22px;object-fit:contain;" />
        </div>`,
        className: '',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -42],
      });
      setReady(true);
    });
  }, []);

  const t = useT();
  if (!ready) return <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">{t.contact.map_loading}</div>;

  return (
    <MapContainer
      center={[23.6345, -102.5528]}
      zoom={5}
      style={{ height: '100%', width: '100%', minHeight: 480 }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {OFFICES.map((office, idx) => (
        <Marker key={idx} position={[office.lat, office.lng]} icon={iconRef.current}>
          <Popup>
            <div style={{ fontFamily: 'Georgia, serif', minWidth: 190, padding: '4px 2px' }}>
              <p style={{ fontWeight: 700, color: '#1e40af', marginBottom: 4, fontSize: 14 }}>{office.city}</p>
              <p style={{ color: '#64748b', fontSize: 12, marginBottom: 4, lineHeight: 1.4 }}>{office.address}</p>
              {office.phones.map((p, pi) => (
                <p key={pi} style={{ color: '#475569', fontSize: 12, margin: '2px 0' }}>📞 {p}</p>
              ))}
              <a href={office.maps} target="_blank" rel="noreferrer"
                style={{ color: '#1e40af', fontSize: 12, display: 'block', marginTop: 6 }}>
                Ver en Google Maps →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Calendly Inline Widget
const CalendlyWidget = () => {
  useEffect(() => {
    if (window.Calendly) {
      window.Calendly.initInlineWidget({
        url: CALENDLY_URL,
        parentElement: document.getElementById('calendly-inline'),
        prefill: {},
        utm: {}
      });
    }
  }, []);

  return (
    <div
      id="calendly-inline"
      className="calendly-inline-widget w-full"
      data-url={CALENDLY_URL}
      style={{ minWidth: '280px', height: '660px' }}
    />
  );
};

// Contact Section with Calendly + Redesigned Offices
const ContactSection = () => {
  const t = useT();
  const [showCalendly, setShowCalendly] = useState(false);

  return (
    <section id="contacto" className="section-light py-16 md:py-24 lg:py-32" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">{t.contact.eyebrow}</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800" data-testid="contact-title">
              {t.contact.title}
            </h2>
            <p className="text-slate-500 text-lg mt-4">{t.contact.subtitle}</p>
          </div>

          {/* Hablar con un Asesor — tarjeta única */}
          <div className="bg-slate-800 p-8 rounded-xl flex flex-col sm:flex-row items-center gap-6 mb-12" data-testid="contact-schedule-card">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center">
                <Calendar size={32} className="text-blue-400" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-serif text-2xl text-white font-semibold mb-1">
                {t.contact.advisor_title}
              </h3>
              <p className="text-slate-400 text-sm">{t.contact.advisor_desc}</p>
            </div>
            <button
              onClick={() => setShowCalendly(true)}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 font-semibold hover:bg-blue-700 transition-colors rounded-lg"
              data-testid="contact-schedule-btn"
            >
              <Calendar size={20} />
              {t.contact.advisor_btn}
            </button>
          </div>

          {/* Calendly Modal */}
          <AnimatePresence>
            {showCalendly && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
                onClick={(e) => e.target === e.currentTarget && setShowCalendly(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h3 className="font-serif text-xl text-slate-800">{t.contact.calendly_title}</h3>
                    <button
                      onClick={() => setShowCalendly(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="p-0">
                    <CalendlyWidget />
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-slate-500 text-sm">{t.contact.calendly_instant}</p>
                    <a
                      href={`https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent("Hola, quisiera hablar con un asesor.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle size={16} />
                      {t.contact.calendly_wa}
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offices Section */}
          <div className="mt-4">
            <div className="text-center mb-8">
              <h3 className="font-serif text-3xl font-semibold text-slate-800">{t.contact.offices_title}</h3>
              <p className="text-slate-500 text-sm mt-2">{t.contact.offices_hint}</p>
            </div>

            <div className="flex flex-col lg:flex-row rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ minHeight: '520px' }}>
              {/* Left: Office Cards */}
              <div className="lg:w-2/5 overflow-y-auto" style={{ maxHeight: '560px' }}>
                {OFFICES.map((office, idx) => (
                  <div
                    key={idx}
                    className="border-b border-slate-100"
                    data-testid={`office-card-${idx}`}
                  >
                    <div className="overflow-hidden h-36">
                      <img
                        src={office.image}
                        alt={office.city}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-base text-slate-800 mb-2">{office.city}</h4>
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-500 text-xs leading-snug">{office.address}</span>
                      </div>
                      {office.phones.map((phone, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2 mb-1">
                          <Phone size={13} className="text-blue-600 flex-shrink-0" />
                          <span className="text-slate-600 text-sm">{phone}</span>
                        </div>
                      ))}
                      <div className="mt-3 flex gap-2">
                        <a
                          href={`https://wa.me/${office.whatsapp}?text=${encodeURIComponent("Hola, me comunico desde su sitio web.")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors"
                          data-testid={`office-whatsapp-${idx}`}
                        >
                          <MessageCircle size={13} />
                          {t.contact.whatsapp}
                        </a>
                        <a
                          href={office.maps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 border border-blue-600 text-blue-600 text-xs py-2 px-3 rounded hover:bg-blue-50 transition-colors"
                        >
                          <MapPin size={13} />
                          {t.contact.see_map}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Leaflet Map — México completo con marcadores REFMEX */}
              <div className="lg:w-3/5 min-h-96 lg:min-h-0" style={{ isolation: 'isolate' }}>
                <OfficesMap />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Terms Modal Component
const TermsModal = ({ isOpen, onClose, title, children }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="bg-white max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl text-slate-800">{title}</DialogTitle>
      </DialogHeader>
      <div className="mt-4 text-slate-600 text-sm leading-relaxed space-y-4">
        {children}
      </div>
    </DialogContent>
  </Dialog>
);

// Footer Component
const Footer = ({ onAdminClick }) => {
  const t = useT();
  const currentYear = new Date().getFullYear();
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  return (
    <footer className="section-dark py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <img src={LOGO_WHITE} alt="REFMEX" className="h-12 mb-4" />
            <p className="text-blue-100/70 text-sm mb-4">{t.footer.tagline}</p>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              data-testid="footer-facebook"
            >
              <Facebook size={20} />
              <span className="text-sm">{t.footer.follow}</span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4">{t.footer.links_title}</h4>
            <ul className="space-y-2">
              {t.footer.links.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="footer-link text-sm hover:text-blue-400">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4">{t.footer.services_title}</h4>
            <ul className="space-y-2">
              {['Auditoría', 'Contabilidad', 'Impuestos', 'Registro REPSE', 'Compliance'].map((service, idx) => (
                <li key={idx}>
                  <a href="#servicios" className="footer-link text-sm hover:text-blue-400">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4">{t.footer.contact_title}</h4>
            <ul className="space-y-3">
              {OFFICES.map((office, idx) => (
                <li key={idx}>
                  <p className="text-blue-300 text-xs mb-1">{office.name}</p>
                  {office.phones.map((phone, pIdx) => (
                    <a key={pIdx} href={`https://wa.me/${office.whatsapp}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-100/70 text-sm hover:text-blue-300 transition-colors">
                      <Phone size={12} className="text-blue-400" />
                      {phone}
                    </a>
                  ))}
                </li>
              ))}
              <li className="flex items-center gap-2 text-blue-100/70 text-sm">
                <Mail size={14} className="text-blue-400" />
                contacto@refmex.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-blue-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-100/60 text-xs">
              © {currentYear} REFMEX. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <button onClick={() => setTermsOpen(true)} className="footer-link text-xs hover:text-blue-400">
                {t.footer.terms}
              </button>
              <button onClick={() => setPrivacyOpen(true)} className="footer-link text-xs hover:text-blue-400">
                {t.footer.privacy}
              </button>
              <button onClick={() => setDisclaimerOpen(true)} className="footer-link text-xs hover:text-blue-400">
                {t.footer.disclaimer}
              </button>
            </div>
          </div>
          <p className="text-blue-100/40 text-xs mt-4 text-center md:text-left">{t.footer.legal}</p>
          <div className="text-right mt-2">
            <button onClick={onAdminClick} className="text-blue-100/20 hover:text-blue-100/50 text-xs transition-colors">
              {t.footer.admin}
            </button>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} title="Términos de Uso">
        <p>Estos Términos de Uso establecen las condiciones legales que rigen el acceso y uso del sitio web de REFMEX. Al acceder, navegar o utilizar este sitio web, usted acepta cumplir con los presentes términos y condiciones.</p>
        
        <h4 className="font-semibold text-slate-800 mt-4">Acerca de este sitio web</h4>
        <p>Este sitio web es propiedad y está operado por REFMEX, empresa dedicada a la prestación de servicios profesionales en materia contable, fiscal, consultoría y servicios relacionados.</p>
        
        <h4 className="font-semibold text-slate-800 mt-4">Uso del contenido</h4>
        <p>El contenido disponible en este sitio web se proporciona únicamente con fines informativos y no constituye asesoría profesional, legal, fiscal o financiera específica. Antes de tomar decisiones que puedan afectar sus finanzas o su negocio, se recomienda consultar directamente con un profesional calificado.</p>
        
        <h4 className="font-semibold text-slate-800 mt-4">Restricciones</h4>
        <p>El usuario no está autorizado a copiar o utilizar software, tecnología o procesos incluidos en este sitio web sin autorización, utilizar el contenido del sitio con fines comerciales sin el consentimiento previo de REFMEX, o realizar acciones que puedan afectar la seguridad, funcionamiento o integridad del sitio web.</p>
        
        <h4 className="font-semibold text-slate-800 mt-4">Derechos de Propiedad Intelectual</h4>
        <p>Todo el contenido de este sitio web, incluyendo textos, imágenes, logotipos, diseño, gráficos y materiales, es propiedad de REFMEX o de sus respectivos licenciantes y está protegido por derechos de autor, marcas registradas y otras leyes de propiedad intelectual.</p>
      </TermsModal>

      {/* Privacy Modal */}
      <TermsModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Declaración de Privacidad">
        <p>El uso de este sitio web está sujeto a nuestra Política de Privacidad, en la cual se describe cómo recopilamos, utilizamos y protegemos la información personal de los usuarios.</p>
        <p>REFMEX se compromete a proteger la privacidad de sus usuarios y a manejar la información personal de manera responsable y conforme a la legislación aplicable.</p>
      </TermsModal>

      {/* Disclaimer Modal */}
      <TermsModal isOpen={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} title="Descargo de Responsabilidad">
        <p>Este sitio web se proporciona "tal cual", sin garantías de ningún tipo, ya sean expresas o implícitas.</p>
        <p>REFMEX no garantiza que la información publicada esté libre de errores o que el sitio web funcione sin interrupciones. El uso de este sitio web es bajo la responsabilidad exclusiva del usuario.</p>
        
        <h4 className="font-semibold text-slate-800 mt-4">Limitación de responsabilidad</h4>
        <p>En la medida máxima permitida por la ley, REFMEX no será responsable por daños directos, indirectos, incidentales, consecuentes o especiales derivados del uso o la imposibilidad de uso de este sitio web.</p>
      </TermsModal>
    </footer>
  );
};

// WhatsApp Floating Button
const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { setIsVisible(window.scrollY > 300); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="whatsapp-float animate-pulse-whatsapp"
          title="¿Necesitas ayuda? Chatea con nosotros"
          data-testid="whatsapp-float-button"
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
};

// Blog Admin Component
const BLANK_ARTICLE = { title: '', excerpt: '', content: '', category: 'empresarios', image_url: '', read_time: '5 min' };

const getAdminHeaders = () => ({
  headers: { 'X-Admin-Token': sessionStorage.getItem('admin_token') || '' }
});

const BlogAdmin = ({ onClose }) => {
  const [authenticated, setAuthenticated] = useState(!!sessionStorage.getItem('admin_token'));
  const [password, setPassword] = useState('');
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(BLANK_ARTICLE);
  const [loading, setLoading] = useState(false);

  const loadArticles = async () => {
    try {
      const res = await axios.get(`${API}/blog`);
      setArticles(res.data);
    } catch {
      toast.error('Error al cargar artículos');
    }
  };

  useEffect(() => { if (authenticated) loadArticles(); }, [authenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/admin/login`, { password });
      sessionStorage.setItem('admin_token', res.data.token);
      setAuthenticated(true);
    } catch {
      toast.error('Contraseña incorrecta');
    }
  };

  const startEdit = (article) => {
    setEditing(article);
    setForm({ title: article.title, excerpt: article.excerpt, content: article.content, category: article.category, image_url: article.image_url || '', read_time: article.read_time });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await axios.put(`${API}/blog/${editing.id}`, form, getAdminHeaders());
        toast.success('Artículo actualizado');
        setEditing(null);
      } else {
        await axios.post(`${API}/blog`, form, getAdminHeaders());
        toast.success('Artículo creado');
        setCreating(false);
      }
      setForm(BLANK_ARTICLE);
      loadArticles();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`¿Eliminar "${title}"?`)) return;
    try {
      await axios.delete(`${API}/blog/${id}`, getAdminHeaders());
      toast.success('Artículo eliminado');
      loadArticles();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const CATEGORIES = [
    { value: 'empresarios', label: 'Para Empresarios' },
    { value: 'fiscalistas', label: 'Para Fiscalistas' },
    { value: 'asalariados', label: 'Para Asalariados' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mb-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800 rounded-t-xl">
          <h2 className="font-serif text-xl text-white">Administración del Blog</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Login Form */}
          {!authenticated ? (
            <form onSubmit={handleLogin} className="max-w-sm mx-auto py-8">
              <p className="text-slate-600 text-center mb-6">Ingresa la contraseña de administrador</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full border border-slate-300 rounded px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button type="submit" className="btn-blue w-full">
                Ingresar
              </button>
            </form>
          ) : (editing || creating) ? (
            /* Article Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <button type="button" onClick={() => { setEditing(null); setCreating(false); setForm(BLANK_ARTICLE); }} className="text-blue-600 hover:underline text-sm">
                  ← Volver a la lista
                </button>
                <h3 className="font-semibold text-slate-800">{editing ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Título *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Resumen *</label>
                <textarea required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Contenido *</label>
                <textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Categoría</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Tiempo de lectura</label>
                  <input value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                    placeholder="ej: 5 min"
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">URL de imagen</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-blue flex-1 disabled:opacity-50">
                  {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Artículo'}
                </button>
                <button type="button" onClick={() => { setEditing(null); setCreating(false); setForm(BLANK_ARTICLE); }}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            /* Articles List */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-800">{articles.length} artículos publicados</h3>
                <button onClick={() => { setCreating(true); setForm(BLANK_ARTICLE); }} className="btn-blue text-sm">
                  + Nuevo Artículo
                </button>
              </div>
              <div className="space-y-3">
                {articles.map((article) => (
                  <div key={article.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:border-blue-200 transition-colors">
                    {article.image_url && (
                      <img src={article.image_url} alt="" className="w-20 h-14 object-cover rounded flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{article.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {CATEGORIES.find((c) => c.value === article.category)?.label} · {article.read_time}
                      </p>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-1">{article.excerpt}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEdit(article)}
                        className="text-xs px-3 py-1.5 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(article.id, article.title)}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                {articles.length === 0 && (
                  <p className="text-center text-slate-400 py-8">No hay artículos. ¡Crea el primero!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [language, setLanguage] = useState('es');
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      if (window.location.hash === '#blog-admin') setShowAdmin(true);
    };
    checkAdmin();
    window.addEventListener('hashchange', checkAdmin);
    return () => window.removeEventListener('hashchange', checkAdmin);
  }, []);

  const closeAdmin = () => {
    setShowAdmin(false);
    history.replaceState(null, '', window.location.pathname);
  };

  return (
    <LangContext.Provider value={language}>
      <div className="App bg-white min-h-screen">
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid rgba(30, 64, 175, 0.2)',
              color: '#0F172A'
            }
          }}
        />
        <Navbar language={language} setLanguage={setLanguage} />
        <HeroSection />
        <AboutSection />
        <ValuesSection />
        <ServicesSection />
        <JobSection />
        <BlogSection />
        <ContactSection />
        <Footer onAdminClick={() => setShowAdmin(true)} />
        <WhatsAppButton />
        {showAdmin && <BlogAdmin onClose={closeAdmin} />}
      </div>
    </LangContext.Provider>
  );
}

export default App;
