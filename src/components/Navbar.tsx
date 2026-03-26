/**
 * Navbar — Barra de navegación principal de AprovechApp
 * Design: Clean Tech Startup con logo personalizado.
 * Responsive: menú hamburguesa en móvil.
 */
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "El Problema", href: "#problema" },
  { label: "Solución", href: "#solucion" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Oportunidad", href: "#oportunidad" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para cambiar el fondo al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const offset = 80; // Compensación por la altura de la navbar
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Sección del Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group"
            onClick={(e) => { 
              e.preventDefault(); 
              window.scrollTo({ top: 0, behavior: "smooth" }); 
            }}
          >
            <img 
              src="/logo.png" 
              alt="Logo AprovechApp" 
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Aprovech<span className="text-emerald-600">App</span>
            </span>
          </a>

          {/* Desktop nav (Menú horizontal) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Botón de Registro (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#registro"
              onClick={(e) => { e.preventDefault(); handleNavClick("#registro"); }}
              className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 shadow-sm shadow-emerald-200"
            >
              Registrarse gratis
            </a>
          </div>

          {/* Botón menú móvil (Hamburguesa) */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Móvil Desplegable */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="px-4 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#registro"
              onClick={(e) => { e.preventDefault(); handleNavClick("#registro"); }}
              className="mt-4 px-4 py-4 bg-emerald-600 text-white font-bold rounded-xl text-center hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-100"
            >
              Registrarse gratis
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}