import { Link, useLocation } from "react-router-dom";
import { Building2, KeyRound, LayoutDashboard, LogOut, ScrollText, ShieldCheck, ShieldOff, UserPlus, Users, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { nomDe, roles } from "../../data/roles.js";
import AvatarAgent from "../AvatarAgent.jsx";
import logo from "../../assets/logo.svg";
import "./Menu.css";

export default function Menu({ isOpen, onFermer }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const sections = [
    {
      titre: "Pilotage",
      liens: [{ label: "Tableau de bord", to: "/", icone: LayoutDashboard }],
    },
    {
      titre: "Identités",
      liens: [
        { label: "Agents", to: "/agents", icone: Users },
        { label: "Enrôlement", to: "/enrolement", icone: UserPlus },
        { label: "Révocations", to: "/revocations", icone: ShieldOff },
      ],
    },
    {
      titre: "Gouvernance",
      liens: [
        { label: "Règles de classification", to: "/classifications", icone: ShieldCheck },
        { label: "Ministères", to: "/ministeres", icone: Building2, superAdmin: true },
        { label: "Rôles et permissions", to: "/roles", icone: KeyRound },
        { label: "Journal d'audit", to: "/audit", icone: ScrollText },
      ],
    },
  ];

  function estActif(to) {
    return to === "/" ? pathname === "/" : pathname.startsWith(to);
  }

  return (
    <>
      <div className={isOpen ? "menu-fond open" : "menu-fond"} onClick={onFermer} />
      <aside className={isOpen ? "menu open" : "menu"}>
        <div className="menu-haut">
          <Link to="/" className="menu-logo" onClick={onFermer}>
            <img src={logo} alt="" />
            <span>
              <strong>MSAP</strong>
              <small>Administration</small>
            </span>
          </Link>
          <button type="button" className="menu-fermer" aria-label="Fermer le menu" onClick={onFermer}>
            <X size={20} />
          </button>
        </div>

        <p className="menu-restreint">
          <KeyRound size={13} />
          Espace à accès restreint
        </p>

        <nav className="menu-nav">
          {sections.map((s) => (
            <div key={s.titre} className="menu-section">
              <span className="menu-titre">{s.titre}</span>
              {s.liens
                .filter((l) => !l.superAdmin || user.role === "super_admin")
                .map((l) => {
                  const Icone = l.icone;
                  return (
                    <Link key={l.to} to={l.to} className={estActif(l.to) ? "menu-lien actif" : "menu-lien"} onClick={onFermer}>
                      <Icone size={18} />
                      {l.label}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>

        <div className="menu-bas">
          <AvatarAgent nom={user.nomComplet} taille={34} />
          <div className="menu-bas-texte">
            <strong>{user.nomComplet}</strong>
            <span>{nomDe(roles, user.role)}</span>
          </div>
          <button type="button" className="menu-deconnexion" aria-label="Se déconnecter" title="Se déconnecter" onClick={logout}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
