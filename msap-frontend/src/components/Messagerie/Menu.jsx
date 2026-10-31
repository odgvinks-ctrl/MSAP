import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bookmark, BookOpenText, FolderLock, LayoutDashboard, LogOut, MessageSquareText, MoreHorizontal, Settings, ShieldCheck, UsersRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLangue } from "../../context/LangueContext.jsx";
import AvatarAgent from "../AvatarAgent.jsx";
import logo from "../../assets/logo.svg";
import "./Menu.css";

export default function Menu({ nonLus }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLangue();
  const [isOpen, setIsOpen] = useState(false);

  const liens = [
    { cle: "nav.messages", to: "/messages", icone: MessageSquareText },
    { cle: "nav.groupes", to: "/groupes", icone: UsersRound },
    { cle: "nav.annuaire", to: "/annuaire", icone: BookOpenText },
    { cle: "nav.fichiers", to: "/fichiers", icone: FolderLock },
    { cle: "nav.enregistres", to: "/enregistres", icone: Bookmark },
    { cle: "nav.securite", to: "/securite", icone: ShieldCheck },
    { cle: "nav.parametres", to: "/parametres", icone: Settings },
  ];

  const estAdmin = ["super_admin", "admin_ministeriel"].includes(user.role);
  const estActif = (to) => pathname.startsWith(to);

  return (
    <>
      <aside className="msg-menu">
        <Link to="/messages" className="msg-menu-logo">
          <img src={logo} alt="" />
          <span>
            <strong>MSAP</strong>
            <small>Messagerie</small>
          </span>
        </Link>

        <nav className="msg-menu-nav">
          {liens.map((l) => {
            const Icone = l.icone;
            return (
              <Link key={l.to} to={l.to} title={t(l.cle)} className={estActif(l.to) ? "msg-menu-lien actif" : "msg-menu-lien"}>
                <Icone size={19} />
                <span className="msg-menu-texte">{t(l.cle)}</span>
                {l.to === "/messages" && nonLus > 0 && <span className="pastille msg-menu-pastille">{nonLus}</span>}
              </Link>
            );
          })}
          {estAdmin && (
            <Link to="/" title="Portail d'administration" className="msg-menu-lien admin">
              <LayoutDashboard size={19} />
              <span className="msg-menu-texte">Portail d'administration</span>
            </Link>
          )}
        </nav>

        <div className="msg-menu-bas">
          <div className="msg-menu-moi">
            <AvatarAgent nom={user.nomComplet} taille={34} presence="disponible" />
            <span className="msg-menu-texte">
              <strong>{user.nomComplet}</strong>
              <small>{user.fonction}</small>
            </span>
          </div>
          <button type="button" className="msg-menu-lien" onClick={logout}>
            <LogOut size={17} />
            <span className="msg-menu-texte">{t("commun.deconnexion")}</span>
          </button>
        </div>
      </aside>

      <nav className="msg-onglets">
        {liens.slice(0, 4).map((l) => {
          const Icone = l.icone;
          return (
            <Link key={l.to} to={l.to} className={estActif(l.to) ? "msg-onglet actif" : "msg-onglet"}>
              <Icone size={20} />
              <span>{t(l.cle).split(" ")[0]}</span>
              {l.to === "/messages" && nonLus > 0 && <span className="msg-onglet-point" />}
            </Link>
          );
        })}
        <button type="button" className={liens.slice(4).some((l) => estActif(l.to)) ? "msg-onglet actif" : "msg-onglet"} onClick={() => setIsOpen(true)}>
          <MoreHorizontal size={20} />
          <span>{t("nav.plus")}</span>
        </button>
      </nav>

      {isOpen && (
        <div className="msg-feuille-fond" onClick={() => setIsOpen(false)}>
          <div className="msg-feuille" onClick={(e) => e.stopPropagation()}>
            <span className="msg-feuille-poignee" />
            {liens.slice(4).map((l) => {
              const Icone = l.icone;
              return (
                <Link key={l.to} to={l.to} className="msg-feuille-lien" onClick={() => setIsOpen(false)}>
                  <Icone size={20} />
                  {t(l.cle)}
                </Link>
              );
            })}
            {estAdmin && (
              <Link to="/" className="msg-feuille-lien" onClick={() => setIsOpen(false)}>
                <LayoutDashboard size={20} />
                Portail d'administration
              </Link>
            )}
            <button type="button" className="msg-feuille-lien danger" onClick={logout}>
              <LogOut size={20} />
              {t("commun.deconnexion")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
