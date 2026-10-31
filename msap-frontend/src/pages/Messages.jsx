import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Search, ShieldCheck } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import Fenetre from "../components/Fenetre.jsx";
import ListeConversations from "../components/Messagerie/ListeConversations.jsx";
import Fil from "../components/Messagerie/Fil.jsx";
import { demarrerConversation, getAnnuaire, getConversations } from "../api/messagerie.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLangue } from "../context/LangueContext.jsx";
import { contient } from "../utils/texte.js";
import logo from "../assets/logo.svg";
import "../components/Messagerie/Chat.css";

export default function Messages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLangue();
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [ministeres, setMinisteres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [nouvelle, setNouvelle] = useState(false);
  const [recherche, setRecherche] = useState("");

  async function charger() {
    try {
      const [c, annuaire] = await Promise.all([getConversations(), getAnnuaire()]);
      setConversations(c);
      setAgents(annuaire.agents);
      setMinisteres(annuaire.ministeres);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "conversations", 4000);

  async function ecrire(agentId) {
    try {
      const c = await demarrerConversation(agentId);
      setNouvelle(false);
      setRecherche("");
      await charger();
      navigate(`/messages/${c.id}`);
    } catch (err) {
      setErreur(err.message);
    }
  }

  const ouverte = conversations.find((c) => c.id === id);
  const sigle = (mid) => ministeres.find((m) => m.id === mid)?.sigle;
  const candidats = agents.filter((a) => a.id !== user.id && a.statut === "actif" && (!recherche || contient(`${a.nomComplet} ${a.fonction}`, recherche)));

  const atouts = [
    { icone: Lock, titre: "Chiffré", desc: "Olm/Megolm, bout en bout" },
    { icone: ShieldCheck, titre: "Identifié", desc: "Agents enrôlés, 2FA" },
    { icone: ShieldCheck, titre: "Souverain", desc: "Hébergé par l'État" },
  ];

  return (
    <div className={ouverte ? "chat ouvert" : "chat"}>
      <div className="chat-liste">
        {erreur && <p className="portail-erreur chat-erreur">{erreur}</p>}
        <ListeConversations
          conversations={conversations}
          agents={agents}
          moi={user.id}
          actif={id}
          chargement={chargement}
          onOuvrir={(cid) => navigate(`/messages/${cid}`)}
          onNouvelle={() => setNouvelle(true)}
        />
      </div>

      {ouverte ? (
        <Fil
          key={ouverte.id}
          conversation={ouverte}
          conversations={conversations}
          agents={agents}
          ministeres={ministeres}
          moi={user.id}
          onRetour={() => navigate("/messages")}
          onOuvrir={(cid) => navigate(`/messages/${cid}`)}
          onEcrire={ecrire}
        />
      ) : (
        <div className="chat-accueil">
          <div className="chat-accueil-logo">
            <img src={logo} alt="" />
          </div>
          <h2>
            {t("accueil.bonjour")}, {user.prenom}
          </h2>
          <p>{id && !chargement ? "Cette conversation n'existe pas ou vous n'y avez plus accès." : "Sélectionnez une conversation ou démarrez-en une nouvelle."}</p>
          <div className="chat-atouts">
            {atouts.map((a) => {
              const Icone = a.icone;
              return (
                <div key={a.titre} className="chat-atout">
                  <Icone size={16} />
                  <strong>{a.titre}</strong>
                  <span>{a.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {nouvelle && (
        <Fenetre titre={t("conv.nouvelle")} sous="Seuls les agents enrôlés et actifs apparaissent." onFermer={() => setNouvelle(false)}>
          <label className="portail-recherche">
            <Search size={16} />
            <input autoFocus value={recherche} placeholder="Rechercher un agent" onChange={(e) => setRecherche(e.target.value)} />
          </label>
          <div className="chat-candidats">
            {candidats.map((a) => (
              <button key={a.id} type="button" className="fil-destination" onClick={() => ecrire(a.id)}>
                <AvatarAgent nom={a.nomComplet} taille={36} presence={a.presence} />
                <span className="portail-ligne-texte">
                  <strong>{a.nomComplet}</strong>
                  <span>
                    {a.fonction} · {sigle(a.ministereId)}
                  </span>
                </span>
              </button>
            ))}
            {candidats.length === 0 && <p className="portail-vide">Aucun agent trouvé.</p>}
          </div>
        </Fenetre>
      )}
    </div>
  );
}
