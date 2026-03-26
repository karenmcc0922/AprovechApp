import { Leaf, Mail, MapPin } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-gray-800 pb-8">
        
        {/* Marca y Descripción */}
        <div className="col-span-1 md:col-span-2">
          <a href="#inicio" className="flex items-center gap-2 mb-4 group inline-flex" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-emerald-500 transition-colors">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Aprovech<span className="text-emerald-500">App</span>
            </span>
          </a>
          <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
            Reduciendo el desperdicio de alimentos y ayudando a tu bolsillo. Salvemos el planeta, una comida deliciosa a la vez.
          </p>
          <div className="flex gap-4">
        
          </div>
        </div>

        {/* Enlaces Rápidos */}
        <div>
          <h4 className="text-white font-semibold mb-4">Descubre</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#problema" className="hover:text-emerald-400 transition-colors">El Problema</a></li>
            <li><a href="#solucion" className="hover:text-emerald-400 transition-colors">Cómo funciona</a></li>
            <li><a href="#beneficios" className="hover:text-emerald-400 transition-colors">Beneficios</a></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contacto</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500" />
              <a href="mailto:hola@aprovechapp.com" className="hover:text-emerald-400 transition-colors">hola@aprovechapp.com</a>
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Pereira, Colombia 🇨🇴
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright y Legales */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} AprovechApp. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Términos de servicio</a>
          <a href="#" className="hover:text-white transition-colors">Política de privacidad</a>
        </div>
      </div>
    </footer>
  );
}