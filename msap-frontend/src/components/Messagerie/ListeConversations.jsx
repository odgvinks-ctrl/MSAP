import { useState } from "react";
import { FileText, Lock, Mic, PenSquare, Pin, Search } from "lucide-react";
import AvatarAgent from "../AvatarAgent.jsx";
import AvatarGroupe from "../AvatarGroupe.jsx";
import { useLangue } from "../../context/LangueContext.jsx";
import { contient, horodatage } from "../../utils/texte.js";
import { apercuMessage, interlocuteur, titreConversation } from "../../utils/conversations.js";

export default function ListeConversations({ conversations, agents, moi, actif, chargement, onOuvrir, onNouvelle }) {
  const { t } = useLangue();
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("toutes");

  const nonLues = conversations.filter((c) => c.nonLus > 0).length;

  const lignes = conversations
    .map((c) => ({ c, titre: titreConversation(c, moi, agents) }))
    .filter(({ c, titre }) => (filtre === "nonlues" ? c.nonLus > 0 : filtre === "groupes" ? c.type === "groupe" : true) && (!recherche || contient(titre, recherche)))
    .sort((a, b) => Number(b.c.epingle) - Number(a.c.epingle) || (b.c.dernier?.date || b.c.creeLe).localeCompare(a.c.dernier?.date || a.c.creeLe));

  const filtres = [
    { id: "toutes", label: t("conv.toutes") },
    { id: "nonlues", label: t("conv.nonlues"), compte: nonLues },
    { id: "groupes", label: t("conv.groupes") },
  ];

  return (
    <div className="liste-conv">
      <div className="liste-conv-haut">
        <div className="liste-conv-titre">
          <h1>{t("nav.messages")}</h1>
          <button type="button" className="chat-icone" title={t("conv.nouvelle")} aria-label={t("conv.nouvelle")} onClick={onNouvelle}>
            <PenSquare size={18} />
          </button>
        </div>
        <label className="liste-conv-recherche">
          <Search size={16} />
          <input value={recherche} placeholder={t("conv.rechercher")} onChange={(e) => setRecherche(e.target.value)} />
        </label>
        <div className="segment">
          {filtres.map((f) => (
            <button key={f.id} type="button" className={filtre === f.id ? "actif" : ""} onClick={() => setFiltre(f.id)}>
              {f.label}
              {f.compte > 0 && <span>{f.compte}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="liste-conv-corps">
        {chargement && <p className="portail-vide">Chargement des conversations…</p>}
        {!chargement && lignes.length === 0 && <p className="portail-vide">Aucune conversation.</p>}
        {lignes.map(({ c, titre }) => {
          const autre = c.type === "direct" ? interlocuteur(c, moi, agents) : null;
          const d = c.dernier;
          const auteur = d && agents.find((a) => a.id === d.auteurId);
          const protege = d && d.classification === "confidentiel";
          let prefixe = "";
          if (d && !d.systeme) prefixe = d.auteurId === moi ? "Vous : " : c.type === "groupe" && auteur ? `${auteur.prenom} : ` : "";
          const IconeApercu = protege ? Lock : d?.vocal ? Mic : d?.piece ? FileText : null;
          const classes = ["liste-conv-ligne", actif === c.id ? "actif" : "", c.nonLus ? "non-lu" : ""].filter(Boolean).join(" ");
          return (
            <button key={c.id} type="button" className={classes} onClick={() => onOuvrir(c.id)}>
              {c.type === "groupe" ? (
                <AvatarGroupe titre={titre} classification={c.classification} taille={44} />
              ) : (
                <AvatarAgent nom={autre ? autre.nomComplet : "?"} taille={44} presence={autre ? autre.presence : undefined} revoque={!autre} />
              )}
              <span className="liste-conv-texte">
                <span className="liste-conv-ligne1">
                  <strong>{titre}</strong>
                  {c.classification !== "standard" && <span className={`badge-niveau mini ${c.classification}`}>{c.classification === "confidentiel" ? "CONF" : "DR"}</span>}
                  <small>{d && horodatage(d.date)}</small>
                </span>
                <span className="liste-conv-ligne2">
                  {IconeApercu && <IconeApercu size={14} className={protege ? "rouge" : ""} />}
                  <span className={d?.systeme ? "italique" : ""}>
                    {prefixe}
                    {protege && d.expire ? "Message confidentiel expiré" : apercuMessage(d)}
                  </span>
                  {c.epingle && !c.nonLus && <Pin size={14} className="liste-conv-epingle" />}
                  {c.nonLus > 0 && <span className="pastille">{c.nonLus}</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
