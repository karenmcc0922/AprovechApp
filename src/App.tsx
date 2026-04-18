import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import CompleteProfile from "./pages/CompleteProfile";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Profile from "./pages/Profile"; // <-- Importamos la nueva página de Perfil

function App() {
  return (
    <Switch>
      {/* 1. Landing Page: El punto de entrada para nuevos usuarios */}
      <Route path="/" component={Home} />
      
      {/* 2. Login: Para usuarios que ya tienen cuenta */}
      <Route path="/login" component={Login} />
      
      {/* 3. Registro Final: El link que llega al correo vía EmailJS */}
      <Route path="/completar-perfil" component={CompleteProfile} />
      
      {/* 4. Catálogo: El corazón de la app (donde se ven los productos) */}
      <Route path="/catalog" component={Catalog} />

      {/* 5. Perfil: Dashboard de impacto y QR del usuario */}
      <Route path="/perfil" component={Profile} />
      
      {/* 6. Error 404: Por si alguien escribe mal una URL */}
      <Route>
        <div className="flex flex-col items-center justify-center min-h-screen font-bold text-slate-400 gap-4">
          <span className="text-6xl">🥑</span>
          <p className="text-xl tracking-tight font-black text-slate-900">
             404 - ¡Este aguacate se perdió!
          </p>
          <a href="/" className="text-green-600 hover:underline">Volver al inicio</a>
        </div>
      </Route>
    </Switch>
  );
}

export default App;