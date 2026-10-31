import { useState } from "react";
import { ArrowDownUp, CheckCircle2, Search, XCircle } from "lucide-react";
import { getAgents } from "../api/agents.js";
import { getAudit } from "../api/audit.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { actionDe, actionsAudit } from "../data/actionsAudit.js";
import { contient, dateHeure } from "../utils/texte.js";
import "./Portail.css";
import "./Audit.css";

function Resultat({ valeur }) {
  return valeur === "succes" ? (
    <span className="badge-statut valide">
      <CheckCircle2 size={13} />
      Succès
    </span>
  ) : (
    <span className="badge-statut refuse">
      <XCircle size={13} />
      Échec
    </span>
  );
}

export default function Audit() {
  const [journal, setJournal] = useState([]);
  const [agents, setAgents] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [action, setAction] = useState("");
  const [resultat, setResultat] = useState("");
  const [recents, setRecents] = useState(true);
  const [detail, setDetail] = useState("");

  async function charger() {
    try {
      const [j, a] = await Promise.all([getAudit(), getAgents()]);
      setJournal(j);
      setAgents(a);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "audit");

  const nom = (id) => {
    if (!id) return "—";
    const a = agents.find((x) => x.id === id);
    return a ? a.nomComplet : "Compte hors ministère";
  };

  const lignes = journal
    .filter((e) => {
      const texte = `${nom(e.auteurId)} ${nom(e.cibleId)} ${e.details} ${e.ip}`;
      return (!action || e.action === action) && (!resultat || e.resultat === resultat) && (!recherche || contient(texte, recherche));
    })
    .sort((a, b) => (recents ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

  return (
    <section className="portail">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <span className="label">Gouvernance</span>
            <h1>Journal d'audit</h1>
            <p className="portail-sous">
              Traçabilité des opérations d'administration et des événements d'authentification. Les entrées ne sont pas modifiables.
            </p>
          </div>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}

        <div className="audit-filtres">
          <label className="portail-recherche">
            <Search size={16} />
            <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Auteur, agent, détail ou adresse IP" aria-label="Rechercher" />
          </label>
          <select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Type d'événement">
            <option value="">Tous les événements</option>
            {actionsAudit.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom}
              </option>
            ))}
          </select>
          <select value={resultat} onChange={(e) => setResultat(e.target.value)} aria-label="Résultat">
            <option value="">Tous les résultats</option>
            <option value="succes">Succès</option>
            <option value="echec">Échec</option>
          </select>
          <button type="button" className="btn-outline" onClick={() => setRecents(!recents)}>
            <ArrowDownUp size={15} />
            {recents ? "Plus récents" : "Plus anciens"}
          </button>
        </div>

        <div className="portail-carte">
          {chargement && <p className="portail-vide">Chargement...</p>}
          {!chargement && lignes.length === 0 && <p className="portail-vide">Aucun événement ne correspond aux filtres.</p>}
          <div className="portail-liste">
            {lignes.map((e) => {
              const type = actionDe(e.action);
              const Icone = type.icone;
              const ouvert = detail === e.id;
              return (
                <div key={e.id} className="audit-entree">
                  <button type="button" className="audit-ligne" onClick={() => setDetail(ouvert ? "" : e.id)} aria-expanded={ouvert}>
                    <span className={e.resultat === "echec" ? "audit-icone echec" : "audit-icone"}>
                      <Icone size={15} />
                    </span>
                    <span className="audit-texte">
                      <strong>{type.nom}</strong>
                      <span>
                        {e.auteurId ? nom(e.auteurId) : "Compte inconnu"}
                        {e.cibleId && e.cibleId !== e.auteurId ? ` → ${nom(e.cibleId)}` : ""}
                      </span>
                    </span>
                    <span className="audit-date">{dateHeure(e.date)}</span>
                    <Resultat valeur={e.resultat} />
                  </button>
                  {ouvert && (
                    <dl className="audit-detail">
                      <div>
                        <dt>Détails</dt>
                        <dd>{e.details}</dd>
                      </div>
                      <div>
                        <dt>Adresse IP</dt>
                        <dd className="mono">{e.ip}</dd>
                      </div>
                      <div>
                        <dt>Référence</dt>
                        <dd className="mono">{e.id}</dd>
                      </div>
                    </dl>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
