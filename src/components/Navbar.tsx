import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { label: "El Problema", href: "#problema" },
  { label: "Solución", href: "#solucion" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Oportunidad", href: "#oportunidad" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-lg shadow-brand-green/5 border-b border-brand-green/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo con Naranja y Verde */}
          <a
            href="#"
            className="flex items-center gap-2 group"
            onClick={(e) => { 
              e.preventDefault(); 
              window.scrollTo({ top: 0, behavior: "smooth" }); 
            }}
          >
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-auto transition-transform duration-500 group-hover:rotate-12" 
              />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">
              Aprovech<span className="text-brand-green font-extrabold">App</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="px-5 py-2 text-sm font-bold text-gray-600 hover:text-brand-green hover:bg-white rounded-xl transition-all duration-300 hover:shadow-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Botón de Registro - NARANJA para destacar */}
          <div className="hidden md:block">
            <a
              href="#registro"
              onClick={(e) => { e.preventDefault(); handleNavClick("#registro"); }}
              className="group flex items-center gap-2 px-6 py-3 bg-brand-orange text-white text-sm font-black rounded-xl hover:bg-brand-orange-dark active:scale-95 transition-all shadow-lg shadow-brand-orange/20"
            >
              Registrarme
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Menú móvil */}
          <button
            className={`md:hidden p-3 rounded-xl transition-all ${
              isOpen ? "bg-brand-orange text-white" : "bg-brand-green-light text-brand-green"
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú móvil desplegable */}
        <div
          className={`md:hidden absolute left-4 right-4 mt-4 overflow-hidden transition-all duration-500 ease-in-out bg-white rounded-3xl shadow-2xl border border-gray-100 ${
            isOpen ? "max-h-[450px] opacity-100 p-6" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="px-6 py-4 text-lg font-bold text-gray-700 hover:text-brand-green hover:bg-brand-green-light rounded-2xl transition-all"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <a
              href="#registro"
              onClick={(e) => { e.preventDefault(); handleNavClick("#registro"); }}
              className="px-6 py-5 bg-brand-orange text-white font-black rounded-2xl text-center shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-3"
            >
              Comenzar ahora
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}