import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Search, ShieldOff, UserPlus } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import FenetreRevocation from "../components/FenetreRevocation.jsx";
import { getAgents } from "../api/agents.js";
import { getMinisteres } from "../api/ministeres.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { nomDe, roles, statuts } from "../data/roles.js";
import { contient, depuis, formaterDate } from "../utils/texte.js";
import "./Portail.css";

const PAR_PAGE = 10;

function EnteteTri({ col, tri, onTrier, children }) {
  return (
    <th>
      <button type="button" className="portail-tri" onClick={() => onTrier(col)}>
        {children}
        {tri.col === col && (tri.sens === 1 ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </button>
    </th>
  );
}

export default function Agents() {
  const [params, setParams] = useSearchParams();
  const [agents, setAgents] = useState([]);
  const [ministeres, setMinisteres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [tri, setTri] = useState({ col: "enroleLe", sens: -1 });
  const [page, setPage] = useState(0);
  const [cible, setCible] = useState(null);
  const [info, setInfo] = useState("");

  const recherche = params.get("q") || "";
  const ministere = params.get("ministere") || "";
  const statut = params.get("statut") || "";

  async function charger() {
    try {
      const [a, m] = await Promise.all([getAgents(), getMinisteres()]);
      setAgents(a);
      setMinisteres(m);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "agents");

  function filtrer(cle, valeur) {
    const suivants = new URLSearchParams(params);
    if (valeur) {
      suivants.set(cle, valeur);
    } else {
      suivants.delete(cle);
    }
    setParams(suivants, { replace: true });
    setPage(0);
  }

  function trier(col) {
    setTri({ col, sens: tri.col === col ? -tri.sens : 1 });
  }

  const sigle = (id) => ministeres.find((m) => m.id === id)?.sigle || "";
  const direction = (a) => ministeres.find((m) => m.id === a.ministereId)?.directions.find((d) => d.id === a.directionId)?.sigle || "";

  const valeurTri = (a) => {
    if (tri.col === "nom") return `${a.nom} ${a.prenom}`;
    if (tri.col === "ministere") return sigle(a.ministereId);
    return a[tri.col] || "";
  };

  const resultats = agents
    .filter((a) => {
      const texte = `${a.nomComplet} ${a.email} ${a.matricule} ${a.fonction}`;
      return (!ministere || a.ministereId === ministere) && (!statut || a.statut === statut) && (!recherche || contient(texte, recherche));
    })
    .sort((a, b) => valeurTri(a).localeCompare(valeurTri(b)) * tri.sens);

  const pages = Math.max(1, Math.ceil(resultats.length / PAR_PAGE));
  const visibles = resultats.slice(page * PAR_PAGE, (page + 1) * PAR_PAGE);
  const compter = (s) => agents.filter((a) => a.statut === s).length;

  return (
    <section className="portail">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <span className="label">Identités</span>
            <h1>Agents</h1>
            <p className="portail-sous">
              {agents.length} comptes · {compter("actif")} actifs · {compter("en_attente")} en attente · {compter("suspendu")} suspendu(s) ·{" "}
              {compter("revoque")} révoqué(s)
            </p>
          </div>
          <Link to="/enrolement" className="btn-primary">
            <UserPlus size={16} />
            Enrôler un agent
          </Link>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {info && <p className="portail-succes">{info}</p>}

        <div className="portail-filtres">
          <label className="portail-recherche">
            <Search size={16} />
            <input
              placeholder="Nom, matricule, adresse, fonction"
              value={recherche}
              onChange={(e) => filtrer("q", e.target.value)}
              aria-label="Rechercher un agent"
            />
          </label>
          <select value={ministere} onChange={(e) => filtrer("ministere", e.target.value)} aria-label="Ministère">
            <option value="">Tous les ministères</option>
            {ministeres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.sigle} · {m.nom}
              </option>
            ))}
          </select>
          <select value={statut} onChange={(e) => filtrer("statut", e.target.value)} aria-label="Statut">
            <option value="">Tous les statuts</option>
            {Object.entries(statuts).map(([id, s]) => (
              <option key={id} value={id}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="portail-carte">
          {chargement && <p className="portail-vide">Chargement...</p>}
          {!chargement && resultats.length === 0 && <p className="portail-vide">Aucun agent ne correspond à votre recherche.</p>}

          {resultats.length > 0 && (
            <>
              <div className="portail-tableau repliable">
                <table>
                  <thead>
                    <tr>
                      <th>Identifiant</th>
                      <EnteteTri col="nom" tri={tri} onTrier={trier}>Agent</EnteteTri>
                      <th>Fonction</th>
                      <EnteteTri col="ministere" tri={tri} onTrier={trier}>Ministère</EnteteTri>
                      <EnteteTri col="statut" tri={tri} onTrier={trier}>Statut</EnteteTri>
                      <EnteteTri col="enroleLe" tri={tri} onTrier={trier}>Enrôlé le</EnteteTri>
                      <EnteteTri col="derniereConnexion" tri={tri} onTrier={trier}>Dernière connexion</EnteteTri>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((a) => (
                      <tr key={a.id} className={a.statut === "revoque" ? "revoque" : ""}>
                        <td className="mono portail-discret">{a.matricule}</td>
                        <td>
                          <div className="portail-personne">
                            <AvatarAgent nom={a.nomComplet} taille={32} revoque={a.statut === "revoque"} />
                            <div className="portail-personne-texte">
                              <Link to={`/agents/${a.id}`}>{a.nomComplet}</Link>
                              <span>{a.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="portail-personne-texte">
                            <strong>{a.fonction}</strong>
                            <span>{nomDe(roles, a.role)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="portail-personne-texte">
                            <strong>{sigle(a.ministereId)}</strong>
                            <span>{direction(a)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-statut ${statuts[a.statut].classe}`}>{statuts[a.statut].nom}</span>
                        </td>
                        <td className="portail-discret">{formaterDate(a.enroleLe)}</td>
                        <td className="portail-discret">{depuis(a.derniereConnexion)}</td>
                        <td>
                          {a.statut !== "revoque" && (
                            <button type="button" className="portail-action" aria-label={`Révoquer ${a.nomComplet}`} title="Révoquer les accès" onClick={() => setCible(a)}>
                              <ShieldOff size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="portail-cartes-mobile">
                {visibles.map((a) => (
                  <Link key={a.id} to={`/agents/${a.id}`} className="portail-ligne">
                    <AvatarAgent nom={a.nomComplet} taille={38} revoque={a.statut === "revoque"} />
                    <div className="portail-ligne-texte">
                      <strong>{a.nomComplet}</strong>
                      <span>
                        {sigle(a.ministereId)} · {a.fonction}
                      </span>
                    </div>
                    <span className={`badge-statut ${statuts[a.statut].classe}`}>{statuts[a.statut].nom}</span>
                  </Link>
                ))}
              </div>

              <div className="portail-pagination">
                <span>
                  {page * PAR_PAGE + 1}–{Math.min(resultats.length, (page + 1) * PAR_PAGE)} sur {resultats.length}
                </span>
                <div>
                  <button type="button" aria-label="Page précédente" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft size={16} />
                  </button>
                  <span>
                    {page + 1} / {pages}
                  </span>
                  <button type="button" aria-label="Page suivante" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {cible && (
        <FenetreRevocation
          agent={cible}
          ministere={ministeres.find((m) => m.id === cible.ministereId)}
          onFermer={() => setCible(null)}
          onRevoque={() => {
            setInfo(`Les accès de ${cible.nomComplet} ont été révoqués.`);
            charger();
          }}
        />
      )}
    </section>
  );
}
