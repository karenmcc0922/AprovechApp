import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Store, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ShoppingBag, 
  Settings,
  Menu
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AppNavbar() {
  const [, setLocation] = useLocation();
  const [pendientesCount, setPendientesCount] = useState(0);
  
  // LEER OBJETO USUARIO COMPLETO (Sincronizado con Login y Catalog)
  const user = JSON.parse(localStorage.getItem("usuario") || "{}");
  const isVendor = user.rol === "aliado" || localStorage.getItem("user_role") === "vendor";
  const userName = user.nombre || localStorage.getItem("user_name") || "Usuario";

  useEffect(() => {
    const checkRescates = () => {
      const guardados = JSON.parse(localStorage.getItem("historial_rescates") || "[]");
      
      if (isVendor) {
        // Si es aliado, cuenta los pendientes que son para SU local
        const count = guardados.filter((r: any) => 
          (r.aliado_id === user.id || r.local === user.nombre) && r.estado === "Pendiente"
        ).length;
        setPendientesCount(count);
      } else {
        // Si es cliente, cuenta sus propios rescates pendientes
        const count = guardados.filter((r: any) => 
          r.usuario_correo === user.correo && r.estado === "Pendiente"
        ).length;
        setPendientesCount(count);
      }
    };

    checkRescates();
    window.addEventListener('storage', checkRescates);
    const interval = setInterval(checkRescates, 2000);
    return () => {
      window.removeEventListener('storage', checkRescates);
      clearInterval(interval);
    };
  }, [isVendor, user.id, user.nombre, user.correo]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    setLocation("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* LOGO DINÁMICO */}
        <Link href={isVendor ? "/aliado" : "/catalog"}>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-green-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Store className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              AprovechApp <span className="text-green-600 text-sm font-bold uppercase tracking-widest ml-1">
                {isVendor ? "Business" : ""}
              </span>
            </span>
          </div>
        </Link>

        {/* MENÚ DE ESCRITORIO */}
        <div className="hidden md:flex items-center gap-6">
          {isVendor ? (
            <>
              <Link href="/aliado">
                <a className="text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Mi Panel
                </a>
              </Link>
              <Link href="/pedidos-recibir">
                <a className="relative text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Pedidos
                  {pendientesCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow-lg shadow-orange-200">
                      {pendientesCount}
                    </span>
                  )}
                </a>
              </Link>
            </>
          ) : (
            <>
              <Link href="/catalog">
                <a className="text-sm font-bold text-slate-600 hover:text-green-600">Explorar</a>
              </Link>
              <Link href="/mis-rescates">
                <a className="relative text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2">
                  Mis Rescates
                  {pendientesCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg shadow-red-200">
                      {pendientesCount}
                    </span>
                  )}
                </a>
              </Link>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-slate-100 p-0 overflow-hidden border-2 border-transparent hover:border-green-500 transition-all">
                <User className="h-5 w-5 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black leading-none">{userName}</p>
                  <p className="text-xs leading-none text-slate-400">
                    {isVendor ? "Cuenta de Aliado" : "Cliente"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <Link href={isVendor ? "/perfil-aliado" : "/perfil"}>
                <DropdownMenuItem className="cursor-pointer rounded-lg font-bold">
                  <Settings className="mr-2 h-4 w-4" /> 
                  {isVendor ? "Configurar Negocio" : "Mi Perfil"}
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer rounded-lg font-bold text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* MÓVIL */}
        <div className="md:hidden flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6" />
          </Button>
        </div>

      </div>
    </nav>
  );
}