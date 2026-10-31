import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Search, ShieldOff } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import FenetreRevocation from "../components/FenetreRevocation.jsx";
import { getAgents } from "../api/agents.js";
import { getMinisteres } from "../api/ministeres.js";
import { etapesRevocation, getRevocations } from "../api/revocations.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { statuts } from "../data/roles.js";
import { contient, dateHeure, depuis } from "../utils/texte.js";
import "./Portail.css";
import "./Revocations.css";

export default function Revocations() {
  const [agents, setAgents] = useState([]);
  const [ministeres, setMinisteres] = useState([]);
  const [revocations, setRevocations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [cible, setCible] = useState(null);
  const [info, setInfo] = useState("");

  async function charger() {
    try {
      const [a, m, r] = await Promise.all([getAgents(), getMinisteres(), getRevocations()]);
      setAgents(a);
      setMinisteres(m);
      setRevocations(r);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "revocations");

  const sigle = (id) => ministeres.find((m) => m.id === id)?.sigle || "";
  const agentDe = (id) => agents.find((a) => a.id === id);
  const candidats =
    recherche.trim().length >= 2
      ? agents.filter((a) => a.statut !== "revoque" && contient(`${a.nomComplet} ${a.matricule} ${a.email}`, recherche)).slice(0, 6)
      : [];

  return (
    <section className="portail">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <span className="label">Identités</span>
            <h1>Révocations</h1>
            <p className="portail-sous">Coupure immédiate des accès d'un agent sur l'ensemble de ses appareils et de ses conversations.</p>
          </div>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {info && <p className="portail-succes">{info}</p>}

        <div className="portail-carte revo-rapide">
          <span className="revo-icone">
            <ShieldOff size={20} />
          </span>
          <div className="revo-rapide-corps">
            <h2>Révocation rapide</h2>
            <p>Recherchez l'agent par son nom, son matricule ou son adresse professionnelle.</p>
            <label className="portail-recherche">
              <Search size={16} />
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Ex. Hamidou Diallo ou AGT-2026-0125"
                aria-label="Rechercher l'agent à révoquer"
              />
            </label>
            {candidats.length > 0 && (
              <div className="revo-candidats">
                {candidats.map((a) => (
                  <div key={a.id} className="portail-ligne">
                    <AvatarAgent nom={a.nomComplet} taille={32} />
                    <div className="portail-ligne-texte">
                      <strong>{a.nomComplet}</strong>
                      <span>
                        <span className="mono">{a.matricule}</span> · {sigle(a.ministereId)} · {a.fonction}
                      </span>
                    </div>
                    <span className={`badge-statut ${statuts[a.statut].classe}`}>{statuts[a.statut].nom}</span>
                    <button type="button" className="btn-danger" onClick={() => setCible(a)}>
                      Révoquer
                    </button>
                  </div>
                ))}
              </div>
            )}
            {recherche.trim().length >= 2 && candidats.length === 0 && <p className="portail-discret">Aucun agent actif ne correspond.</p>}
          </div>
        </div>

        <h2 className="revo-titre">Historique des révocations</h2>
        {chargement && <p className="portail-vide">Chargement...</p>}
        {!chargement && revocations.length === 0 && <p className="portail-vide">Aucune révocation.</p>}

        <div className="revo-grille">
          {revocations.map((r) => {
            const agent = agentDe(r.agentId);
            const auteur = agentDe(r.auteurId);
            return (
              <article key={r.id} className="portail-carte revo-carte">
                <div className="revo-carte-haut">
                  <AvatarAgent nom={agent ? agent.nomComplet : "?"} taille={40} revoque />
                  <div className="portail-ligne-texte">
                    {agent ? <Link to={`/agents/${agent.id}`}>{agent.nomComplet}</Link> : <strong>Agent {r.agentId}</strong>}
                    <span>{agent ? `${agent.fonction} · ${sigle(agent.ministereId)}` : ""}</span>
                  </div>
                  <span className="portail-discret">{depuis(r.date)}</span>
                </div>
                <p className="revo-motif">
                  Motif : <strong>{r.motif}</strong>
                </p>
                <ul className="revo-etapes">
                  {etapesRevocation.map((e) => (
                    <li key={e.cle}>
                      <CheckCircle2 size={14} />
                      {e.libelle}
                    </li>
                  ))}
                </ul>
                <p className="revo-pied">
                  {dateHeure(r.date)} · par {auteur ? auteur.nomComplet : "un administrateur"} · {r.appareils} appareil(s) · {r.salons} salon(s)
                </p>
              </article>
            );
          })}
        </div>
      </div>

      {cible && (
        <FenetreRevocation
          agent={cible}
          ministere={ministeres.find((m) => m.id === cible.ministereId)}
          onFermer={() => {
            setCible(null);
            setRecherche("");
          }}
          onRevoque={() => {
            setInfo(`Les accès de ${cible.nomComplet} ont été révoqués.`);
            charger();
          }}
        />
      )}
    </section>
  );
}
