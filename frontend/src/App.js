import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
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

// WhatsApp configuration
const WHATSAPP_MAIN = "529612298120";
const WHATSAPP_MESSAGE = encodeURIComponent("Hola, me gustaría agendar una asesoría con REFMEX.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_MAIN}?text=${WHATSAPP_MESSAGE}`;

// Facebook URL
const FACEBOOK_URL = "https://www.facebook.com/RefmexRedDeEstudios";

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

// Values data with full descriptions
const VALUES = [
  { 
    icon: Shield, 
    title: "Integridad", 
    desc: "Actuar con honestidad, lealtad y veracidad en nuestras relaciones profesionales. Además, no asociarse con información falsa, confusa o presentada de manera descuidada. Si se relacionan con información de ese tipo, deben tomar medidas para desvincularse de ella."
  },
  { 
    icon: Eye, 
    title: "Objetividad", 
    desc: "Mantenemos en nuestro trabajo un juicio profesional imparcial, evitando prejuicios, conflictos de interés o influencias indebidas de terceros. Si alguna situación afecta a la objetividad, la firma no realiza el servicio profesional, para asegurar decisiones justas y confiables."
  },
  { 
    icon: Award, 
    title: "Diligencia y Competencia", 
    desc: "Realizar nuestro trabajo con cuidado, responsabilidad y conforme a las normas profesionales. Además, de mantenernos actualizados para ofrecer servicios competentes, aplicando siempre un juicio profesional adecuado."
  },
  { 
    icon: Lock, 
    title: "Confidencialidad", 
    desc: "Proteger la información obtenida de los usuarios. No deben revelarse información confidencial sin autorización, salvo cuando exista una obligación legal o profesional. Tampoco pueden utilizarse información para beneficio propio o de terceros."
  },
  { 
    icon: Briefcase, 
    title: "Comportamiento Profesional", 
    desc: "Cumplir con las leyes, normas y reglamentos aplicables en el ejercicio de su profesión. Asimismo, deben evitar cualquier conducta o acción que pueda desacreditar o dañar la reputación de la profesión contable."
  }
];

// Offices data with updated phone numbers
const OFFICES = [
  { 
    name: "Sede Chiapas", 
    address: "Calle 13a. Poniente Sur 985, Chiapas", 
    phones: ["961 229 8120", "961 128 9177"],
    whatsapp: "529612298120",
    maps: "https://www.google.com/maps/search/Calle%2013a.%20Poniente%20Sur%20985/@16.74809455871582,-93.12777709960938,17z?hl=es"
  },
  { 
    name: "Sede Nuevo León", 
    address: "Pino Sur 209, Valle del Virrey, CP 67257", 
    phones: ["813 586 5600"],
    whatsapp: "528135865600",
    maps: "https://www.google.com/maps?q=Pino+Sur+209,+Valle+Sur,+67257+Cdad.+Benito+Ju%C3%A1rez,+N.L."
  },
  { 
    name: "Sede Estado de México", 
    address: "Valle de los Piracantos 48, Izcalli del Valle, Tultitlán, CP 54945", 
    phones: ["557 500 9770"],
    whatsapp: "525575009770",
    maps: "https://www.google.com/maps/search/Valle%20de%20los%20piracantos%2048%20izcalli%20del%20valle%20tultitlan/@19.58583223,-99.18466924,17z?hl=es"
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
                <h4 className="font-semibold text-slate-800 mb-3">Requisitos para Personas Físicas:</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-sm">
                  {REPSE_FISICAS.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ol>
                <p className="text-slate-500 text-sm mt-2 italic">
                  Datos adicionales: Dos teléfonos y correos, relación de activos de la empresa, registros y/o certificaciones, entre otros.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Requisitos para Personas Morales:</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-sm">
                  {REPSE_MORALES.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ol>
                <p className="text-slate-500 text-sm mt-2 italic">
                  Datos adicionales: Dos teléfonos y correos, relación de activos de la empresa, registros y/o certificaciones, entre otros.
                </p>
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
            Contratar Servicio
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Navbar Component
const Navbar = ({ language, setLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "#nosotros", label: "Nosotros" },
    { href: "#servicios", label: "Servicios" },
    { href: "#bolsa-trabajo", label: "Bolsa de Trabajo" },
    { href: "#blog", label: "Blog" },
    { href: "#contacto", label: "Contacto" }
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
                Agendar Asesoría
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
              Agendar Asesoría
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hero Section
const HeroSection = () => {
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
            Más que un proveedor de servicios;{" "}
            <span className="text-blue-300">tu aliado estratégico para el crecimiento</span>
          </h1>
          
          <p className="text-blue-100/80 text-base sm:text-lg lg:text-xl text-center max-w-3xl mb-10" data-testid="hero-subtitle">
            Ayudamos a personas y empresas a tomar mejores decisiones financieras con integridad y profesionalismo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="#servicios"
              onClick={(e) => { e.preventDefault(); document.querySelector('#servicios').scrollIntoView({ behavior: 'smooth' }); }}
              className="btn-white flex items-center justify-center gap-2"
              data-testid="hero-services-btn"
            >
              Nuestros Servicios
              <ChevronRight size={18} />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-white-outline flex items-center justify-center gap-2"
              data-testid="hero-contact-btn"
            >
              Contactar a un Asesor
              <MessageCircle size={18} />
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0" data-testid="hero-stats">
            <div className="text-center px-8">
              <div className="text-blue-300 text-4xl sm:text-5xl font-serif font-medium">30+</div>
              <div className="text-blue-100/70 text-sm uppercase tracking-wider mt-1">Años de Experiencia</div>
            </div>
            <div className="stat-divider hidden sm:block" />
            <div className="text-center px-8">
              <div className="text-blue-300 text-4xl sm:text-5xl font-serif font-medium">3</div>
              <div className="text-blue-100/70 text-sm uppercase tracking-wider mt-1">Oficinas en México</div>
            </div>
            <div className="stat-divider hidden sm:block" />
            <div className="text-center px-8">
              <div className="text-blue-300 text-4xl sm:text-5xl font-serif font-medium">13+</div>
              <div className="text-blue-100/70 text-sm uppercase tracking-wider mt-1">Servicios Especializados</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// About Section with updated content
const AboutSection = () => {
  return (
    <section id="nosotros" className="section-light py-24 md:py-32" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">Conócenos</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-slate-800" data-testid="about-title">
              ¿Quiénes Somos?
            </h2>
            <p className="text-slate-500 text-lg mt-4">Red de Estudios Fiscales de México</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
                <p className="text-blue-800 font-medium italic">
                  "Todo gran proyecto comienza con una idea clara: ayudar a las personas y empresas a tomar mejores decisiones financieras."
                </p>
              </div>
              
              <p className="text-slate-600 leading-relaxed">
                Nuestra Firma <span className="text-blue-700 font-semibold">REFMEX</span> nació por la necesidad de compartir experiencias entre fiscalistas y abogados, actualmente todos socios ante el Instituto Mexicano Contadores Públicos, que avalan la capacidad técnica para el ejercicio de la profesión.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Desde nuestros inicios entendimos que la contaduría no solo consiste en cumplir obligaciones fiscales, sino en brindar tranquilidad a los empresarios aplicando un criterio prudencial.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Nuestros socios cuentan con experiencia de hasta <span className="font-semibold">30 años</span>, cada uno en su campo como especialista.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Creemos firmemente que una firma contable debe ser más que un proveedor de servicios; debe ser un <span className="text-blue-700 font-semibold">aliado estratégico para el crecimiento</span> de cada negocio.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { icon: Clock, title: "Experiencia", desc: "Hasta 30 años de experiencia" },
                  { icon: Users, title: "Equipo", desc: "Socios del IMCP certificados" },
                  { icon: MapPin, title: "Presencia", desc: "3 estados de México" },
                  { icon: Award, title: "Certificación", desc: "Capacidad técnica avalada" }
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
                <p className="font-serif text-lg font-medium">¿Qué Hacemos?</p>
                <p className="text-sm mt-1 opacity-90">
                  Nos especializamos en auditoría, aseguramiento, consultoría, asesoría fiscal y servicios relacionados.
                </p>
              </div>
            </div>
          </div>
          
          {/* What We Do Section */}
          <div className="mt-20 bg-slate-50 p-8 rounded-lg">
            <h3 className="font-serif text-2xl text-slate-800 mb-6">Nuestro Compromiso</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <p className="text-slate-600 leading-relaxed">
                Nuestro propósito es generar un <span className="font-semibold">impacto significativo</span> en cada cliente y en cada proyecto en el que participamos. Creemos en el valor de la integridad, el servicio al interés público y la innovación como motores de crecimiento.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Colaboramos estrechamente con nuestros clientes para ayudarles a alcanzar sus objetivos, sin importar el tamaño de sus retos o aspiraciones. Nuestro enfoque se basa en acompañarlos con <span className="font-semibold">soluciones estratégicas, confianza y profesionalismo</span> para construir juntos un futuro mejor.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Values Section with Ethics
const ValuesSection = () => {
  const ethicsPrinciples = [
    { letter: "a", title: "Integridad", desc: "Ser leal, veraz y honrado en todas las relaciones profesionales y de negocios." },
    { letter: "b", title: "Objetividad", desc: "Evitar prejuicios, conflictos de interés o influencia indebida de terceros que afecten el juicio profesional o de negocios." },
    { letter: "c", title: "Diligencia y competencia profesionales", desc: "Mantener el conocimiento profesional y las habilidades al nivel necesario que aseguren que el cliente o la entidad para la que se trabaja reciben servicios profesionales competentes basados en los últimos avances de la práctica, la legislación y las técnicas, y actuar con diligencia y de conformidad con las normas técnicas y profesionales aplicables." },
    { letter: "d", title: "Confidencialidad", desc: "Respetar la confidencialidad de la información obtenida como resultado de relaciones profesionales o de negocios y, por lo tanto, no revelar dicha información a terceros sin la autorización apropiada y específica, a menos que haya un derecho u obligación legal o profesional de hacerlo, ni usar la información para provecho personal o de terceros." },
    { letter: "e", title: "Comportamiento profesional", desc: "Cumplir con las leyes y reglamentos relevantes, y evitar cualquier acción que desacredite a la profesión." }
  ];

  return (
    <section id="valores" className="section-gray py-24 md:py-32 relative overflow-hidden" data-testid="values-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">Ética y Profesionalismo</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-slate-800" data-testid="values-title">
              Valores que nos Distinguen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {VALUES.map((value, idx) => (
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
                  <value.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="font-serif text-xl text-slate-800 mb-3">{value.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Ethics Section */}
          <div className="bg-white p-8 rounded-lg border border-blue-100">
            <h3 className="font-serif text-2xl text-slate-800 mb-6 flex items-center gap-3">
              <Shield className="text-blue-600" size={28} />
              Ética Profesional
            </h3>
            <p className="text-slate-600 mb-6">
              Aplicamos a cabalidad los principios fundamentales establecidos en el código de ética profesional del contador independiente:
            </p>
            <div className="space-y-4">
              {ethicsPrinciples.map((principle, idx) => (
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
  const [selectedService, setSelectedService] = useState(null);

  return (
    <section id="servicios" className="section-light py-24 md:py-32 relative" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">Lo que hacemos</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-slate-800" data-testid="services-title">
              Nuestros Servicios
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">
              Servicios especializados en materia fiscal, contable y legal adaptados a tus necesidades
            </p>
          </div>

          <div className="services-grid">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="card-refmex cursor-pointer group"
                onClick={() => setSelectedService(service)}
                data-testid={`service-card-${idx}`}
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <service.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="font-serif text-lg text-slate-800 mb-2">{service.title}</h3>
                <p className="text-slate-500 text-sm mb-4">{service.desc}</p>
                <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver más <ChevronRight size={16} />
                </span>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-blue inline-flex items-center gap-2"
              data-testid="services-cta-button"
            >
              Contáctanos para una Solución Personalizada
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

      toast.success('¡Aplicación enviada exitosamente!', {
        description: 'Nos pondremos en contacto contigo pronto.'
      });

      setFormData({
        nombre: '',
        edad: '',
        puesto: '',
        grado_academico: '',
        salario_deseado: '',
        cv: null
      });
    } catch (error) {
      toast.error('Error al enviar la aplicación', {
        description: 'Por favor intenta de nuevo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="bolsa-trabajo" className="section-dark py-24 md:py-32" data-testid="job-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-4">Carreras</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-white" data-testid="job-title">
              Postúlate y Trabaja en REFMEX
            </h2>
            <p className="text-blue-100/70 text-lg mt-4">
              Forma parte de una red de profesionales comprometidos con la excelencia
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Content - Positions */}
            <div>
              <h3 className="font-serif text-2xl text-white mb-6">Puestos Disponibles</h3>
              <div className="grid grid-cols-2 gap-4">
                {JOB_POSITIONS.map((position, idx) => (
                  <div 
                    key={idx} 
                    className="bg-blue-900/30 border border-blue-500/20 p-4 rounded-lg hover:border-blue-400/40 transition-colors cursor-pointer"
                    onClick={() => setFormData({ ...formData, puesto: position })}
                  >
                    <Briefcase size={20} className="text-blue-400 mb-2" />
                    <p className="text-white text-sm font-medium">{position}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h4 className="text-white font-medium mb-4">¿Por qué trabajar con nosotros?</h4>
                <ul className="space-y-3">
                  {[
                    "Ambiente de trabajo profesional y colaborativo",
                    "Oportunidades de crecimiento y desarrollo",
                    "Capacitación continua y actualización",
                    "Proyectos desafiantes con clientes diversos"
                  ].map((item, idx) => (
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
              <h3 className="font-serif text-xl text-white mb-6">Formulario de Postulación</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input-underline input-dark"
                    placeholder="Tu nombre completo"
                    data-testid="job-input-nombre"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                      Edad *
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
                      Puesto al que se Postula *
                    </label>
                    <Select 
                      value={formData.puesto} 
                      onValueChange={(value) => setFormData({ ...formData, puesto: value })}
                    >
                      <SelectTrigger className="bg-transparent border-0 border-b-2 border-blue-500/30 rounded-none text-white focus:ring-0 focus:border-blue-400 h-12" data-testid="job-select-puesto">
                        <SelectValue placeholder="Seleccionar puesto" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-blue-500/30">
                        {JOB_POSITIONS.map((pos, idx) => (
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
                    Grado Académico Más Alto
                  </label>
                  <input
                    type="text"
                    value={formData.grado_academico}
                    onChange={(e) => setFormData({ ...formData, grado_academico: e.target.value })}
                    className="input-underline input-dark"
                    placeholder="Ej: Licenciatura en Contaduría"
                    data-testid="job-input-grado"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                    ¿Cuánto Desea Ganar? (Mensual)
                  </label>
                  <input
                    type="text"
                    value={formData.salario_deseado}
                    onChange={(e) => setFormData({ ...formData, salario_deseado: e.target.value })}
                    className="input-underline input-dark"
                    placeholder="Ej: $25,000 MXN"
                    data-testid="job-input-salario"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-blue-300 block mb-2">
                    Adjunta tu CV *
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
                  {isSubmitting ? 'Enviando...' : 'Enviar Postulación'}
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
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('empresarios');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        await axios.post(`${API}/blog/seed`);
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
    { id: 'empresarios', label: 'Para Empresarios' },
    { id: 'fiscalistas', label: 'Para Fiscalistas' },
    { id: 'asalariados', label: 'Para Asalariados' }
  ];

  return (
    <section id="blog" className="section-gray py-24 md:py-32" data-testid="blog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">Recursos</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-slate-800" data-testid="blog-title">
              Blog
            </h2>
            <p className="text-slate-500 text-lg mt-4">
              Contenido especializado para mantenerte informado
            </p>
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
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
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
              Consulta con un Experto
              <ArrowRight size={18} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Contact Section with Calendar
const ContactSection = () => {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <section id="contacto" className="section-light py-24 md:py-32" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">Contáctanos</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-slate-800" data-testid="contact-title">
              Estamos Para Atenderte
            </h2>
            <p className="text-slate-500 text-lg mt-4">
              Visítanos en cualquiera de nuestras oficinas o agenda una cita
            </p>
          </div>

          {/* Main CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Chat Direct */}
            <div className="bg-blue-gradient p-8 text-center rounded-lg" data-testid="contact-chat-card">
              <MessageCircle size={48} className="text-white/80 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-white font-medium mb-4">
                Contáctate con Nosotros
              </h3>
              <p className="text-white/80 mb-6">
                Chat directo por WhatsApp para resolver tus dudas
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent("Hola, me gustaría obtener información sobre sus servicios.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3 font-semibold hover:bg-blue-50 transition-colors rounded"
                data-testid="contact-whatsapp-main"
              >
                <MessageCircle size={20} />
                Iniciar Chat
              </a>
            </div>

            {/* Schedule Appointment */}
            <div className="bg-slate-800 p-8 text-center rounded-lg" data-testid="contact-schedule-card">
              <Calendar size={48} className="text-blue-400 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-white font-medium mb-4">
                Hablar con un Asesor
              </h3>
              <p className="text-slate-300 mb-6">
                Agenda una cita con nuestro equipo de expertos
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent("Hola, me gustaría agendar una cita con un asesor.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 font-semibold hover:bg-blue-700 transition-colors rounded"
                data-testid="contact-schedule-btn"
              >
                <Calendar size={20} />
                Agendar Asesoría
              </a>
            </div>
          </div>

          {/* Offices Grid */}
          <h3 className="font-serif text-2xl text-slate-800 mb-6 text-center">Nuestras Oficinas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFICES.map((office, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="office-card"
                data-testid={`office-card-${idx}`}
              >
                <h4 className="font-serif text-xl text-slate-800 mb-4">{office.name}</h4>
                <div className="space-y-3 mb-4">
                  <a 
                    href={office.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 hover:text-blue-600 transition-colors group"
                  >
                    <MapPin size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 text-sm group-hover:text-blue-600">{office.address}</span>
                    <ExternalLink size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  {office.phones.map((phone, phoneIdx) => (
                    <div key={phoneIdx} className="flex items-center gap-3">
                      <Phone size={18} className="text-blue-600" />
                      <span className="text-slate-600 text-sm">{phone}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={`https://wa.me/${office.whatsapp}?text=${encodeURIComponent("Hola, me comunico desde su sitio web.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-blue-outline w-full flex items-center justify-center gap-2 text-sm"
                  data-testid={`office-whatsapp-${idx}`}
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
                <a
                  href={office.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <MapPin size={16} />
                  Ver en Google Maps
                </a>
              </motion.div>
            ))}
          </div>

          {/* Building Image */}
          <div className="mt-12 overflow-hidden rounded-lg">
            <img 
              src={IMAGES.building} 
              alt="Edificio Corporativo" 
              className="w-full h-64 md:h-80 object-cover"
            />
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
const Footer = () => {
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
            <p className="text-blue-100/70 text-sm mb-4">
              Red de Estudios Fiscales de México. Tu aliado estratégico para el crecimiento empresarial.
            </p>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              data-testid="footer-facebook"
            >
              <Facebook size={20} />
              <span className="text-sm">Síguenos en Facebook</span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {['Nosotros', 'Servicios', 'Bolsa de Trabajo', 'Blog', 'Contacto'].map((link, idx) => (
                <li key={idx}>
                  <a href={`#${link.toLowerCase().replace(/\s/g, '-')}`} className="footer-link text-sm hover:text-blue-400">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4">Servicios Destacados</h4>
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
            <h4 className="font-serif text-lg text-white mb-4">Contacto</h4>
            <ul className="space-y-3">
              {OFFICES.map((office, idx) => (
                <li key={idx}>
                  <p className="text-blue-300 text-xs mb-1">{office.name}</p>
                  {office.phones.map((phone, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-blue-100/70 text-sm">
                      <Phone size={12} className="text-blue-400" />
                      {phone}
                    </div>
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
                Términos de Uso
              </button>
              <button onClick={() => setPrivacyOpen(true)} className="footer-link text-xs hover:text-blue-400">
                Declaración de Privacidad
              </button>
              <button onClick={() => setDisclaimerOpen(true)} className="footer-link text-xs hover:text-blue-400">
                Descargo de Responsabilidad
              </button>
            </div>
          </div>
          <p className="text-blue-100/40 text-xs mt-4 text-center md:text-left">
            El uso del contenido de este sitio es exclusivamente informativo y no constituye asesoría profesional. Consulte a un especialista para su caso particular.
          </p>
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
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
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

// Main App Component
function App() {
  const [language, setLanguage] = useState('es');

  return (
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
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
