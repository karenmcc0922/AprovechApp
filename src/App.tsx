import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import CompleteProfile from "./pages/CompleteProfile";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import RegistroAliado from "./pages/RegistroAliado";
import Aliado from "./pages/Aliado";
import PerfilAliado from "./pages/PerfilAliado"; 
import MisRescates from "./pages/MisRescates"; 
import PedidosAliado from "./pages/PedidosAliado"; 
// import VitrinaAliado from "./pages/VitrinaAliado"; // <--- Importarías la vista pública cuando la crees

function App() {
  return (
    <Switch>
      {/* 1. Landing Page */}
      <Route path="/" component={Home} />
      
      {/* 2. Login Centralizado */}
      <Route path="/login" component={Login} />
      
      {/* 3. Flujo Comercio (Aliado - Privado) */}
      <Route path="/registro-aliado" component={RegistroAliado} />
      <Route path="/aliado" component={Aliado} /> {/* Dashboard Principal */}
      <Route path="/perfil-aliado" component={PerfilAliado} /> {/* Configuración/Ajustes de su propio local */}
      <Route path="/pedidos-recibir" component={PedidosAliado} /> 
      
      {/* 4. Flujo Usuario (Rescatista) */}
      <Route path="/completar-perfil" component={CompleteProfile} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/perfil" component={Profile} />
      <Route path="/mis-rescates" component={MisRescates} /> 
      
      {/* 5. Vista Pública del Comercio (Para el cliente) */}
      {/* <Route path="/aliado/:id" component={VitrinaAliado} /> */} {/* <--- RUTA DINÁMICA CLAVE */}

      {/* 6. Error 404 */}
      <Route>
        <div className="flex flex-col items-center justify-center min-h-screen font-bold text-slate-400 gap-4 bg-slate-50">
          <span className="text-6xl animate-bounce">🥑</span>
          <p className="text-xl tracking-tight font-black text-slate-900">
             404 - ¡Este aguacate se perdió!
          </p>
          <a href="/" className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
            Volver al inicio
          </a>
        </div>
      </Route>
    </Switch>
  );
}

export default App;