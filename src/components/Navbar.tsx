import { useState, useEffect } from "react";
import { Menu, X, Leaf } from "lucide-react";

const navLinks = [
  { label: "Problema", href: "#problema" },
  { label: "Solución", href: "#solucion" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Registro", href: "#registro" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed w-full z-50 transition ${
        scrolled
          ? "bg-white shadow-sm border-b"
          : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <Leaf className="text-emerald-600" />
          Aprovech<span className="text-emerald-600">App</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="px-4 py-2 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>
    </header>
  );
}