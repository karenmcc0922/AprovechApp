import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import CompleteProfile from "./pages/CompleteProfile";
import Catalog from "./pages/Catalog"; // <-- Importamos el catálogo

function App() {
  return (
    <Switch>
      {/* Landing Page */}
      <Route path="/" component={Home} />
      
      {/* Página de registro final desde el correo */}
      <Route path="/completar-perfil" component={CompleteProfile} />
      
      {/* Catálogo Principal de Productos */}
      <Route path="/catalog" component={Catalog} />
      
      {/* Error 404 */}
      <Route>
        <div className="flex items-center justify-center min-h-screen font-bold">
          404 - Página no encontrada
        </div>
      </Route>
    </Switch>
  );
}

export default App;