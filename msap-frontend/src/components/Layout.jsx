import { useState } from "react";
import { Outlet } from "react-router-dom";
import Menu from "./Portail/Menu.jsx";
import Entete from "./Portail/Entete.jsx";
import "./Layout.css";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="cadre">
      <Menu isOpen={isOpen} onFermer={() => setIsOpen(false)} />
      <div className="cadre-droite">
        <Entete onMenu={() => setIsOpen(true)} />
        <main className="cadre-contenu">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
