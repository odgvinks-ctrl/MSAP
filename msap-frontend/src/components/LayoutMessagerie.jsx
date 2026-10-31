import { useState } from "react";
import { Outlet } from "react-router-dom";
import Menu from "./Messagerie/Menu.jsx";
import { getConversations } from "../api/messagerie.js";
import { useActualisation } from "../hooks/useActualisation.js";
import "./LayoutMessagerie.css";

export default function LayoutMessagerie() {
  const [nonLus, setNonLus] = useState(0);

  useActualisation(async () => {
    const liste = await getConversations();
    setNonLus(liste.reduce((total, c) => total + c.nonLus, 0));
  }, "non-lus", 4000);

  return (
    <div className="msg-cadre">
      <Menu nonLus={nonLus} />
      <main className="msg-contenu">
        <Outlet />
      </main>
    </div>
  );
}
