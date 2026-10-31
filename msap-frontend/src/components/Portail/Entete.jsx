import { useLocation } from "react-router-dom";
import { Menu as IconeMenu } from "lucide-react";
import { modeDemo } from "../../api/http.js";
import { reinitialiserBase } from "../../api/base.js";
import "./Entete.css";

const titres = {
  "/": "Tableau de bord",
  "/agents": "Agents",
  "/enrolement": "Enrôlement",
  "/revocations": "Révocations",
  "/classifications": "Règles de classification",
  "/ministeres": "Ministères",
  "/roles": "Rôles et permissions",
  "/audit": "Journal d'audit",
};

export default function Entete({ onMenu }) {
  const { pathname } = useLocation();
  const racine = `/${pathname.split("/")[1]}`;
  const titre = titres[racine] || "Portail";

  return (
    <header className="entete">
      <div className="entete-gauche">
        <button type="button" className="entete-menu" aria-label="Ouvrir le menu" onClick={onMenu}>
          <IconeMenu size={22} />
        </button>
        <p className="entete-fil">
          <span>Portail d'administration</span>
          <span className="entete-sep">/</span>
          <strong>{titre}</strong>
        </p>
      </div>

      <div className="entete-droite">
        {modeDemo && (
          <>
            <span className="entete-demo">Démonstration</span>
            <button type="button" className="entete-reinit" onClick={reinitialiserBase}>
              Réinitialiser les données
            </button>
          </>
        )}
        {!modeDemo && (
          <span className="entete-etat">
            <span className="entete-point" />
            Connecté au serveur
          </span>
        )}
      </div>
    </header>
  );
}
