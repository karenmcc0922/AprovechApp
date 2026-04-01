import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import CompleteProfile from "./pages/CompleteProfile";

function App() {
  return (
    <Switch>
      {/* Cuando la URL sea "/", muestra la Landing */}
      <Route path="/" component={Home} />
      
      {/* Cuando venga del correo, muestra esta página */}
      <Route path="/completar-perfil" component={CompleteProfile} />
      
      {/* Si no encuentra la ruta */}
      <Route>404 Not Found</Route>
    </Switch>
  );
}

export default App;