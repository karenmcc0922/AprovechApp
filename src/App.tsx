import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import CompleteProfile from "./pages/CompleteProfile";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import RegistroAliado from "./pages/RegistroAliado";
import Aliado from "./pages/Aliado";
import PerfilAliado from "./pages/PerfilAliado"; 

function App() {
  return (
    <Switch>
      {/* 1. Landing Page */}
      <Route path="/" component={Home} />
      
      {/* 2. Login Centralizado */}
      <Route path="/login" component={Login} />
      
      {/* 3. Flujo Comercio (Aliado) */}
      <Route path="/registro-aliado" component={RegistroAliado} />
      <Route path="/aliado" component={Aliado} />
      <Route path="/perfil-aliado" component={PerfilAliado} /> {/* <--- Ruta conectada con la Navbar */}
      
      {/* 4. Flujo Usuario (Rescatista) */}
      <Route path="/completar-perfil" component={CompleteProfile} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/perfil" component={Profile} />

      {/* 5. Error 404 */}
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