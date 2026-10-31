import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, PauseCircle, Pencil, Phone, PlayCircle, RefreshCw, ShieldOff } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import FenetreRevocation from "../components/FenetreRevocation.jsx";
import { getAgent, modifierAgent, reactiverAgent, renvoyerActivation, suspendreAgent } from "../api/agents.js";
import { getMinisteres } from "../api/ministeres.js";
import { getAudit } from "../api/audit.js";
import { getRevocations } from "../api/revocations.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { nomDe, roles, statuts } from "../data/roles.js";
import { actionDe } from "../data/actionsAudit.js";
import { dateHeure, depuis, formaterDate } from "../utils/texte.js";
import "./Portail.css";
import "./FicheAgent.css";

export default function FicheAgent() {
  const { id } = useParams();
  const { user } = useAuth();
  const [agent, setAgent] = useState(null);
  const [ministeres, setMinisteres] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [revocation, setRevocation] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");
  const [edition, setEdition] = useState(false);
  const [form, setForm] = useState(null);
  const [fenetre, setFenetre] = useState(false);

  async function charger() {
    try {
      const [a, m, j, r] = await Promise.all([getAgent(id), getMinisteres(), getAudit(), getRevocations()]);
      setAgent(a);
      setMinisteres(m);
      setHistorique(j.filter((e) => e.cibleId === id || e.auteurId === id).slice(0, 8));
      setRevocation(r.find((x) => x.agentId === id) || null);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, id);

  async function action(fonction, message) {
    try {
      const resultat = await fonction(agent.id);
      setInfo(typeof message === "function" ? message(resultat) : message);
      setErreur("");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  function ouvrirEdition() {
    setForm({ fonction: agent.fonction, directionId: agent.directionId, role: agent.role, telephone: agent.telephone });
    setEdition(true);
    setInfo("");
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fonction.trim()) {
      setErreur("La fonction est obligatoire.");
      return;
    }
    try {
      await modifierAgent(agent.id, form);
      setEdition(false);
      setInfo("Fiche mise à jour.");
      setErreur("");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  if (chargement) {
    return (
      <section className="portail">
        <p className="portail-vide">Chargement...</p>
      </section>
    );
  }

  if (!agent) {
    return (
      <section className="portail">
        <div className="portail-contenu">
          <p className="portail-erreur">{erreur || "Cet agent n'existe pas."}</p>
          <Link to="/agents" className="btn-outline">
            Retour aux agents
          </Link>
        </div>
      </section>
    );
  }

  const ministere = ministeres.find((m) => m.id === agent.ministereId);
  const direction = ministere?.directions.find((d) => d.id === agent.directionId);
  const rolesPossibles = user.role === "super_admin" ? roles : roles.filter((r) => r.id !== "super_admin");

  return (
    <section className="portail">
      <div className="portail-contenu">
        <Link to="/agents" className="fiche-retour">
          <ArrowLeft size={16} />
          Tous les agents
        </Link>

        <div className={agent.statut === "revoque" ? "fiche-entete portail-carte revoque" : "fiche-entete portail-carte"}>
          <AvatarAgent nom={agent.nomComplet} taille={64} revoque={agent.statut === "revoque"} />
          <div className="fiche-identite">
            <h1>{agent.nomComplet}</h1>
            <p>{agent.fonction}</p>
            <div className="fiche-badges">
              <span className={`badge-statut ${statuts[agent.statut].classe}`}>{statuts[agent.statut].nom}</span>
              <span className="badge-role">{nomDe(roles, agent.role)}</span>
            </div>
          </div>
          {agent.statut !== "revoque" && !edition && (
            <div className="portail-actions">
              <button type="button" className="btn-outline" onClick={ouvrirEdition}>
                <Pencil size={15} />
                Modifier
              </button>
              {agent.statut === "actif" && agent.id !== user.id && (
                <button type="button" className="btn-outline" onClick={() => action(suspendreAgent, "Compte suspendu.")}>
                  <PauseCircle size={15} />
                  Suspendre
                </button>
              )}
              {agent.statut === "suspendu" && (
                <button type="button" className="btn-outline" onClick={() => action(reactiverAgent, "Compte réactivé.")}>
                  <PlayCircle size={15} />
                  Réactiver
                </button>
              )}
              {agent.statut === "en_attente" && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => action(renvoyerActivation, (r) => `Nouveau code d'activation : ${r.codeActivation} (valable ${r.expireDansHeures} h).`)}
                >
                  <RefreshCw size={15} />
                  Renvoyer le code
                </button>
              )}
            </div>
          )}
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {info && <p className="portail-succes">{info}</p>}
        {revocation && (
          <p className="portail-erreur">
            Accès révoqués le {dateHeure(revocation.date)} · motif : {revocation.motif}
          </p>
        )}

        <div className="fiche-grille">
          <div className="portail-carte">
            <div className="portail-carte-entete">
              <h2>{edition ? "Modifier les informations" : "Informations professionnelles"}</h2>
            </div>
            {!edition ? (
              <dl className="fiche-infos">
                <div>
                  <dt>Matricule</dt>
                  <dd className="mono">{agent.matricule}</dd>
                </div>
                <div>
                  <dt>Enrôlé le</dt>
                  <dd>{formaterDate(agent.enroleLe)}</dd>
                </div>
                <div className="large">
                  <dt>Ministère</dt>
                  <dd>{ministere?.nom}</dd>
                </div>
                <div className="large">
                  <dt>Direction</dt>
                  <dd>{direction?.nom}</dd>
                </div>
                <div className="large">
                  <dt>Adresse professionnelle</dt>
                  <dd className="fiche-icone">
                    <Mail size={14} />
                    {agent.email}
                  </dd>
                </div>
                <div>
                  <dt>Téléphone de bureau</dt>
                  <dd className="fiche-icone">
                    <Phone size={14} />
                    {agent.telephone || "Non renseigné"}
                  </dd>
                </div>
                <div>
                  <dt>Dernière connexion</dt>
                  <dd>{depuis(agent.derniereConnexion)}</dd>
                </div>
                <div>
                  <dt>Appareils connectés</dt>
                  <dd>{agent.appareils}</dd>
                </div>
                <div>
                  <dt>Salons</dt>
                  <dd>{agent.salons}</dd>
                </div>
              </dl>
            ) : (
              <form className="fiche-form" onSubmit={handleSubmit}>
                <label className="champ">
                  Fonction
                  <input name="fonction" value={form.fonction} onChange={handleChange} />
                </label>
                <label className="champ">
                  Direction
                  <select name="directionId" value={form.directionId} onChange={handleChange}>
                    {ministere?.directions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.sigle} · {d.nom}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="champ">
                  Rôle
                  <select name="role" value={form.role} onChange={handleChange}>
                    {rolesPossibles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nom}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="champ">
                  Téléphone de bureau
                  <input name="telephone" value={form.telephone} onChange={handleChange} />
                </label>
                <p className="portail-discret">Le nom, le matricule et l'adresse relèvent du référentiel RH et ne se modifient pas ici.</p>
                <div className="portail-actions">
                  <button type="button" className="btn-outline" onClick={() => setEdition(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Enregistrer
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="fiche-colonne">
            {agent.statut !== "revoque" && agent.id !== user.id && (
              <div className="portail-carte fiche-danger">
                <ShieldOff size={20} />
                <div>
                  <h2>Révocation immédiate</h2>
                  <p>Coupe l'accès sur tous ses appareils et le retire de ses salons, y compris des conversations en cours.</p>
                  <button type="button" className="btn-danger" onClick={() => setFenetre(true)}>
                    <ShieldOff size={15} />
                    Révoquer les accès
                  </button>
                </div>
              </div>
            )}

            <div className="portail-carte">
              <div className="portail-carte-entete">
                <h2>Historique</h2>
              </div>
              {historique.length === 0 && <p className="portail-vide">Aucun événement.</p>}
              <ol className="fiche-historique">
                {historique.map((e) => (
                  <li key={e.id} className={e.resultat === "echec" ? "echec" : ""}>
                    <strong>{actionDe(e.action).nom}</strong>
                    <span>
                      {e.details} · {depuis(e.date)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {fenetre && (
        <FenetreRevocation
          agent={agent}
          ministere={ministere}
          onFermer={() => setFenetre(false)}
          onRevoque={() => {
            setInfo("");
            charger();
          }}
        />
      )}
    </section>
  );
}
