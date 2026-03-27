import { Mail, MapPin} from "lucide-react";

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-brand-green/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
        
        {/* Columna 1: Marca y Branding (Logo protagonista) */}
        <div className="col-span-1 md:col-span-5 flex flex-col items-start">
          <a 
            href="#inicio" 
            className="flex items-center gap-3 mb-6 group" 
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            <img 
              src="/logo.png" 
              alt="Logo AprovechApp" 
              className="h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" 
            />
            <span className="text-2xl font-black text-white tracking-tighter">
              Aprovech<span className="text-brand-green">App</span>
            </span>
          </a>
          
          <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-md">
            Reduciendo el desperdicio de alimentos y ayudando a tu bolsillo. 
            <span className="text-brand-orange font-semibold"> Salvemos el planeta</span>, una comida deliciosa a la vez.
          </p>

          {/* Redes Sociales con colores de marca */}
          <div className="flex gap-4">
          </div>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className="col-span-1 md:col-span-3">
          <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-green rounded-full"></span>
            Nuestra App
          </h4>
          <ul className="space-y-4">
            {[
              { label: "El Problema", href: "#problema" },
              { label: "Cómo funciona", href: "#solucion" },
              { label: "Beneficios", href: "#beneficios" },
              { label: "Mercado", href: "#oportunidad" }
            ].map((link) => (
              <li key={link.label}>
                <a 
                  href={link.href} 
                  className="text-gray-400 hover:text-brand-green hover:translate-x-1 inline-block transition-all duration-200 font-medium"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: Contacto (Pereira) */}
        <div className="col-span-1 md:col-span-4">
          <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-orange rounded-full"></span>
            Contacto
          </h4>
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 space-y-4">
            <a 
              href="mailto:hola@aprovechapp.com" 
              className="flex items-center gap-3 text-gray-300 hover:text-brand-orange transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-brand-orange" />
              </div>
              <span className="font-medium">hola@aprovechapp.com</span>
            </a>
            
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand-green" />
              </div>
              <div>
                <p className="font-medium leading-none">Pereira, Colombia</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Eje Cafetero 🇨🇴</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright final con degradado */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-900 flex flex-col md:row justify-between items-center gap-6">
        <p className="text-sm text-gray-500 font-medium text-center">
          &copy; {currentYear} <span className="text-gray-300">AprovechApp</span>. Hecho con ❤️ para un mundo más sostenible.
        </p>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
          <a href="#" className="text-gray-600 hover:text-brand-green transition-colors">Términos</a>
          <a href="#" className="text-gray-600 hover:text-brand-green transition-colors">Privacidad</a>
          <a href="#" className="text-gray-600 hover:text-brand-green transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  );
}