import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LangueProvider } from "./context/LangueContext.jsx";
import Layout from "./components/Layout.jsx";
import LayoutMessagerie from "./components/LayoutMessagerie.jsx";
import RouteProtegee from "./components/RouteProtegee.jsx";
import Connexion from "./pages/Connexion.jsx";
import TableauBord from "./pages/TableauBord.jsx";
import Agents from "./pages/Agents.jsx";
import FicheAgent from "./pages/FicheAgent.jsx";
import Enrolement from "./pages/Enrolement.jsx";
import Revocations from "./pages/Revocations.jsx";
import Classifications from "./pages/Classifications.jsx";
import Ministeres from "./pages/Ministeres.jsx";
import Roles from "./pages/Roles.jsx";
import Audit from "./pages/Audit.jsx";
import NonTrouve from "./pages/NonTrouve.jsx";
import Messages from "./pages/Messages.jsx";
import Groupes from "./pages/Groupes.jsx";
import Annuaire from "./pages/Annuaire.jsx";
import Fichiers from "./pages/Fichiers.jsx";
import Enregistres from "./pages/Enregistres.jsx";
import Securite from "./pages/Securite.jsx";
import Parametres from "./pages/Parametres.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangueProvider>
          <Routes>
            <Route path="login" element={<Connexion />} />
            <Route
              element={
                <RouteProtegee>
                  <LayoutMessagerie />
                </RouteProtegee>
              }
            >
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:id" element={<Messages />} />
              <Route path="groupes" element={<Groupes />} />
              <Route path="annuaire" element={<Annuaire />} />
              <Route path="fichiers" element={<Fichiers />} />
              <Route path="enregistres" element={<Enregistres />} />
              <Route path="securite" element={<Securite />} />
              <Route path="parametres" element={<Parametres />} />
            </Route>
            <Route
              element={
                <RouteProtegee roles={["super_admin", "admin_ministeriel"]}>
                  <Layout />
                </RouteProtegee>
              }
            >
              <Route index element={<TableauBord />} />
              <Route path="agents" element={<Agents />} />
              <Route path="agents/:id" element={<FicheAgent />} />
              <Route path="enrolement" element={<Enrolement />} />
              <Route path="revocations" element={<Revocations />} />
              <Route path="classifications" element={<Classifications />} />
              <Route
                path="ministeres"
                element={
                  <RouteProtegee roles={["super_admin"]}>
                    <Ministeres />
                  </RouteProtegee>
                }
              />
              <Route path="roles" element={<Roles />} />
              <Route path="audit" element={<Audit />} />
              <Route path="*" element={<NonTrouve />} />
            </Route>
          </Routes>
        </LangueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
