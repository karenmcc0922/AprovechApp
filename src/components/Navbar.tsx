import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, UserCircle, Store } from "lucide-react";
import { Link } from "wouter";

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
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-white/80 backdrop-blur-lg shadow-lg py-3" : "bg-transparent py-5"
    }`}>
      <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 group cursor-pointer">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto transition-transform group-hover:rotate-12" />
              <span className="text-2xl font-black text-gray-900 tracking-tighter">
                Aprovech<span className="text-green-700">App</span>
              </span>
            </a>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="px-5 py-2 text-sm font-bold text-gray-600 hover:text-green-700 hover:bg-white rounded-xl transition-all">
                {link.label}
              </a>
            ))}
          </div>

          {/* Acciones */}
          <div className="hidden md:flex items-center gap-3">
            {/* BOTÓN SUMAR NEGOCIO (NUEVO) */}
            <Link href="/registro-aliado">
              <a className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-green-700 border-2 border-green-100 hover:border-green-600 rounded-xl transition-all cursor-pointer">
                <Store className="w-4 h-4" />
                Sumar mi negocio
              </a>
            </Link>

            <Link href="/login">
              <a className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:text-green-700 transition-colors cursor-pointer">
                <UserCircle className="w-5 h-5 opacity-70" />
                Entrar
              </a>
            </Link>

            <a href="#registro" onClick={(e) => { e.preventDefault(); handleNavClick("#registro"); }}
              className="group flex items-center gap-2 px-6 py-3 bg-[#FFA832] text-white text-sm font-black rounded-xl hover:bg-amber-500 transition-all shadow-lg shadow-amber-200"
            >
              Registrarme
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Menú móvil */}
          <button className={`md:hidden p-3 rounded-xl transition-all ${isOpen ? "bg-[#FFA832] text-white" : "bg-green-50 text-green-700"}`}
            onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú móvil desplegable */}
        <div className={`md:hidden absolute left-4 right-4 mt-4 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-[500px] opacity-100 p-6" : "max-h-0 opacity-0 invisible"
        }`}>
          <div className="flex flex-col gap-3">
            <Link href="/registro-aliado"><a className="px-6 py-4 text-lg font-bold text-green-700 bg-green-50 rounded-2xl flex items-center gap-2"><Store /> Sumar mi negocio</a></Link>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="px-6 py-4 text-lg font-bold text-gray-700 hover:bg-slate-50 rounded-2xl transition-all">
                {link.label}
              </a>
            ))}
            <Link href="/login"><a className="px-6 py-4 text-lg font-bold text-center text-gray-600 border-2 border-gray-100 rounded-2xl">Ya tengo cuenta</a></Link>
          </div>
        </div>
      </nav>
    </header>
  );
}