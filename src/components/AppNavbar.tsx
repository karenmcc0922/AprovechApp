import { Link } from "wouter";
import { User, ShoppingBasket, Leaf, LogOut } from "lucide-react";

export default function AppNavbar() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <Link href="/catalog">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-green-700 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Leaf className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              Aprovech<span className="text-green-700">App</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/catalog">
            <a className="text-sm font-bold text-gray-600 hover:text-green-700 transition-colors hidden sm:flex items-center gap-2">
              <ShoppingBasket className="w-4 h-4" />
              Explorar
            </a>
          </Link>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <span className="text-xs font-bold text-slate-400 hidden lg:block uppercase tracking-widest">
              {localStorage.getItem("user_name") || "Rescatista"}
            </span>
            <Link href="/perfil">
              <div className="bg-green-50 p-2.5 rounded-2xl hover:bg-green-100 transition-all cursor-pointer border border-green-100">
                <User className="w-5 h-5 text-green-700" />
              </div>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all cursor-pointer"
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