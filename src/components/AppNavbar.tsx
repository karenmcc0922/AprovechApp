import { Link } from "wouter";
import { User, ShoppingBasket, Leaf, LogOut } from "lucide-react";

export default function AppNavbar() {
  // Función opcional para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("user_name");
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-green-700 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Leaf className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              Aprovech<span className="text-green-700">App</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/catalog">
            <a className="text-sm font-bold text-gray-600 hover:text-green-700 transition-colors flex items-center gap-2">
              <ShoppingBasket className="w-4 h-4" />
              Explorar
            </a>
          </Link>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <span className="text-xs font-bold text-slate-400 hidden md:block">
              {localStorage.getItem("user_name") || "Usuario"}
            </span>
            <Link href="/perfil">
              <div className="bg-gray-100 p-2 rounded-full hover:bg-green-100 transition-colors cursor-pointer">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}