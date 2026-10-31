import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, MessageSquareText, Phone, Search, UsersRound } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import Fenetre from "../components/Fenetre.jsx";
import { demarrerConversation, getAnnuaire } from "../api/messagerie.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLangue } from "../context/LangueContext.jsx";
import { contient } from "../utils/texte.js";
import "./Portail.css";
import "./Espace.css";
import "../components/Messagerie/Chat.css";

export default function Annuaire() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLangue();
  const [agents, setAgents] = useState([]);
  const [ministeres, setMinisteres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [ministere, setMinistere] = useState("");
  const [direction, setDirection] = useState("");
  const [profil, setProfil] = useState(null);

  async function charger() {
    try {
      const annuaire = await getAnnuaire();
      setAgents(annuaire.agents);
      setMinisteres(annuaire.ministeres);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "annuaire", 10000);

  async function ecrire(a) {
    try {
      const c = await demarrerConversation(a.id);
      navigate(`/messages/${c.id}`);
    } catch (err) {
      setErreur(err.message);
    }
  }

  const directions = ministeres.find((m) => m.id === ministere)?.directions || [];
  const liste = agents
    .filter((a) => (!ministere || a.ministereId === ministere) && (!direction || a.directionId === direction) && (!recherche || contient(`${a.nomComplet} ${a.fonction}`, recherche)))
    .sort((a, b) => a.nom.localeCompare(b.nom));
  const parMinistere = ministeres.map((m) => ({ m, agents: liste.filter((a) => a.ministereId === m.id) })).filter((g) => g.agents.length);
  const pm = profil && ministeres.find((m) => m.id === profil.ministereId);

  function presence(a) {
    return a.statut === "en_attente" ? "Activation en attente" : t(`presence.${a.presence}`);
  }

  return (
    <div className="portail espace">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <h1>Annuaire de l'administration</h1>
            <p className="portail-sous">Agents enrôlés, classés par ministère et par direction. Seules les coordonnées professionnelles sont visibles.</p>
          </div>
        </div>

        <div className="portail-filtres">
          <label className="portail-recherche">
            <Search size={16} />
            <input value={recherche} placeholder="Nom, prénom ou fonction" onChange={(e) => setRecherche(e.target.value)} />
          </label>
          <select
            aria-label="Ministère"
            value={ministere}
            onChange={(e) => {
              setMinistere(e.target.value);
              setDirection("");
            }}
          >
            <option value="">Tous les ministères</option>
            {ministeres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.sigle} · {m.nom}
              </option>
            ))}
          </select>
          <select aria-label="Direction" value={direction} disabled={!ministere} onChange={(e) => setDirection(e.target.value)}>
            <option value="">Toutes les directions</option>
            {directions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.sigle} · {d.nom}
              </option>
            ))}
          </select>
        </div>
        <p className="portail-discret">{liste.length} agent(s)</p>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {chargement && <p className="portail-vide">Chargement de l'annuaire…</p>}
        {!chargement && liste.length === 0 && (
          <div className="portail-carte portail-vide">
            <UsersRound size={28} />
            <p>Aucun agent ne correspond. Modifiez la recherche ou les filtres.</p>
          </div>
        )}

        {parMinistere.map(({ m, agents: membres }) => (
          <section key={m.id} className="annuaire-section">
            <div className="annuaire-titre">
              <span className="annuaire-sigle">{m.sigle}</span>
              <h2>{m.nom}</h2>
              <small>{membres.length}</small>
            </div>
            <div className="annuaire-grille">
              {membres.map((a) => {
                const d = m.directions.find((x) => x.id === a.directionId);
                return (
                  <div key={a.id} className="portail-carte annuaire-carte">
                    <button type="button" className="annuaire-qui" onClick={() => setProfil(a)}>
                      <AvatarAgent nom={a.nomComplet} taille={44} presence={a.presence} />
                      <span className="portail-ligne-texte">
                        <strong>{a.nomComplet}</strong>
                        <span>{a.fonction}</span>
                        <span>
                          {d?.sigle} · <em className={`presence-texte ${a.presence}`}>{presence(a)}</em>
                        </span>
                      </span>
                    </button>
                    {a.id !== user.id && a.statut === "actif" && (
                      <button type="button" className="chat-icone" aria-label={`Écrire à ${a.prenom}`} onClick={() => ecrire(a)}>
                        <MessageSquareText size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {profil && (
        <Fenetre titre="Fiche agent" onFermer={() => setProfil(null)}>
          <div className="annuaire-identite">
            <AvatarAgent nom={profil.nomComplet} taille={84} presence={profil.presence} />
            <h3>{profil.nomComplet}</h3>
            <p>{profil.fonction}</p>
            <span className={`presence-texte ${profil.presence}`}>{presence(profil)}</span>
            {profil.id !== user.id && profil.statut === "actif" && (
              <button type="button" className="btn-primary annuaire-ecrire" onClick={() => ecrire(profil)}>
                <MessageSquareText size={16} />
                Démarrer une conversation
              </button>
            )}
          </div>
          <div className="annuaire-details">
            <p>
              <Building2 size={16} />
              <span>
                <span className="label">Rattachement</span>
                {pm?.nom}
                <small>{pm?.directions.find((d) => d.id === profil.directionId)?.nom}</small>
              </span>
            </p>
            <p>
              <Mail size={16} />
              <span>
                <span className="label">Adresse professionnelle</span>
                {profil.email}
              </span>
            </p>
            <p>
              <Phone size={16} />
              <span>
                <span className="label">Téléphone de bureau</span>
                {profil.telephone || "—"}
              </span>
            </p>
          </div>
          <p className="portail-discret">Seules les coordonnées professionnelles autorisées par l'administration sont affichées.</p>
        </Fenetre>
      )}
    </div>
  );
}
