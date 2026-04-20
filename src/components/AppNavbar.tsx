import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Store, User, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
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
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Función centralizada para cargar todos los datos de sesión
    const loadAppData = () => {
      const stored = localStorage.getItem("usuario");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setUserData(user);

          // Lógica de conteo de notificaciones (Pedidos pendientes)
          const guardados = JSON.parse(localStorage.getItem("historial_rescates") || "[]");
          const isVendor = user.role === "vendor";
          
          if (isVendor) {
            const count = guardados.filter((r: any) => 
              (r.aliado_id === user.id) && r.estado === "Pendiente"
            ).length;
            setPendientesCount(count);
          } else {
            const count = guardados.filter((r: any) => 
              r.usuario_id === user.id && r.estado === "Pendiente"
            ).length;
            setPendientesCount(count);
          }
        } catch (e) {
          console.error("Error al procesar datos del usuario", e);
        }
      }
    };

    loadAppData();

    // Sincronización entre pestañas y actualización automática cada 5 segundos
    window.addEventListener('storage', loadAppData);
    const interval = setInterval(loadAppData, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadAppData);
    };
  }, []);

  // Variables derivadas del estado actual
  const isVendor = userData?.role === "vendor";
  const userName = userData?.nombre || "Usuario";

  const handleLogout = () => {
    localStorage.clear();
    setUserData(null);
    // Forzamos el salto a la página de inicio y recarga total
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* LOGO DINÁMICO */}
        <Link href={isVendor ? "/aliado" : "/catalog"}>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-green-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-green-200">
              <Store className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              AprovechApp 
              {isVendor && (
                <span className="text-green-600 text-sm font-bold uppercase tracking-widest ml-2 bg-green-50 px-2 py-0.5 rounded-md">
                  Business
                </span>
              )}
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN Y PERFIL */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* MENÚ DE ESCRITORIO */}
          <div className="hidden md:flex items-center gap-6">
            {isVendor ? (
              <>
                <Link href="/aliado">
                  <a className="text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Mi Panel
                  </a>
                </Link>
                <Link href="/pedidos-recibir">
                  <a className="relative text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2 transition-colors">
                    <ShoppingBag className="w-4 h-4" /> 
                    Pedidos 
                    {pendientesCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                        {pendientesCount}
                      </span>
                    )}
                  </a>
                </Link>
              </>
            ) : (
              <>
                <Link href="/catalog">
                  <a className="text-sm font-bold text-slate-600 hover:text-green-600 transition-colors">Explorar</a>
                </Link>
                <Link href="/mis-rescates">
                  <a className="relative text-sm font-bold text-slate-600 hover:text-green-600 transition-colors">
                    Mis Rescates 
                    {pendientesCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {pendientesCount}
                      </span>
                    )}
                  </a>
                </Link>
              </>
            )}
          </div>

          {/* MENÚ DESPLEGABLE DE USUARIO */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 w-11 rounded-full bg-slate-100 hover:bg-slate-200 p-0 border-2 border-white shadow-sm ring-1 ring-slate-100">
                <User className="h-5 w-5 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-slate-100">
              <DropdownMenuLabel className="px-3 py-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Conectado como:</p>
                  <p className="text-base font-black text-slate-900 truncate uppercase">{userName}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-50" />
              
              <Link href={isVendor ? "/perfil-aliado" : "/perfil"}>
                <DropdownMenuItem className="cursor-pointer py-3 rounded-xl font-bold text-slate-600 focus:bg-slate-50 focus:text-green-600 transition-all">
                  <User className="mr-3 h-4 w-4" /> Ver Mi Perfil
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator className="bg-slate-50" />
              
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-600 font-bold py-3 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-700 transition-all"
              >
                <LogOut className="mr-3 h-4 w-4" /> Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  );
}