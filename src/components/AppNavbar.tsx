import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Store, User, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AppNavbar() {
  const [, setLocation] = useLocation();
  const [pendientesCount, setPendientesCount] = useState(0);
  
  const user = JSON.parse(localStorage.getItem("usuario") || "{}");
  // CORRECCIÓN: Usamos 'vendor' como estándar
  const isVendor = user.role === "vendor" || localStorage.getItem("user_role") === "vendor";
  const userName = user.nombre || "Usuario";

  useEffect(() => {
    const checkRescates = () => {
      const guardados = JSON.parse(localStorage.getItem("historial_rescates") || "[]");
      if (isVendor) {
        const count = guardados.filter((r: any) => (r.aliado_id === user.id) && r.estado === "Pendiente").length;
        setPendientesCount(count);
      } else {
        const count = guardados.filter((r: any) => r.usuario_id === user.id && r.estado === "Pendiente").length;
        setPendientesCount(count);
      }
    };
    checkRescates();
    const interval = setInterval(checkRescates, 5000);
    return () => clearInterval(interval);
  }, [isVendor, user.id]);

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href={isVendor ? "/aliado" : "/catalog"}>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-green-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Store className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              AprovechApp <span className="text-green-600 text-sm font-bold uppercase tracking-widest ml-1">{isVendor ? "Business" : ""}</span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {isVendor ? (
            <>
              <Link href="/aliado"><a className="text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Mi Panel</a></Link>
              <Link href="/pedidos-recibir"><a className="relative text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Pedidos {pendientesCount > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 rounded-full">{pendientesCount}</span>}</a></Link>
            </>
          ) : (
            <>
              <Link href="/catalog"><a className="text-sm font-bold text-slate-600 hover:text-green-600">Explorar</a></Link>
              <Link href="/mis-rescates"><a className="text-sm font-bold text-slate-600 hover:text-green-600">Mis Rescates {pendientesCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendientesCount}</span>}</a></Link>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full bg-slate-100 p-0"><User className="h-5 w-5 text-slate-600" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-bold"><LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}