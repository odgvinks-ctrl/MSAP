import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import { getAgents } from "../api/agents.js";
import { getMinisteres } from "../api/ministeres.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { statuts } from "../data/roles.js";
import "./Portail.css";
import "./Ministeres.css";

export default function Ministeres() {
  const [ministeres, setMinisteres] = useState([]);
  const [agents, setAgents] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [ouvert, setOuvert] = useState("");

  async function charger() {
    try {
      const [m, a] = await Promise.all([getMinisteres(), getAgents()]);
      setMinisteres(m);
      setAgents(a);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "ministeres", 10000);

  return (
    <section className="portail">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <span className="label">Gouvernance</span>
            <h1>Ministères et structures</h1>
            <p className="portail-sous">Structures administratives raccordées à MSAP. Noms génériques utilisés pour la démonstration.</p>
          </div>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {chargement && <p className="portail-vide">Chargement...</p>}

        <div className="mini-liste">
          {ministeres.map((m) => {
            const siens = agents.filter((a) => a.ministereId === m.id);
            const actifs = siens.filter((a) => a.statut === "actif").length;
            const responsable = agents.find((a) => a.id === m.responsableId);
            const estOuvert = ouvert === m.id;
            return (
              <article key={m.id} className="portail-carte mini-carte">
                <button type="button" className="mini-haut" onClick={() => setOuvert(estOuvert ? "" : m.id)} aria-expanded={estOuvert}>
                  <span className="mini-sigle">{m.sigle}</span>
                  <span className="mini-texte">
                    <strong>{m.nom}</strong>
                    <span>
                      {siens.length} agents · {actifs} actifs · {m.directions.length} directions · administrateur :{" "}
                      {responsable ? responsable.nomComplet : "—"}
                    </span>
                  </span>
                  <span className="mini-barre" aria-hidden="true">
                    <span style={{ width: `${siens.length ? (actifs / siens.length) * 100 : 0}%` }} />
                  </span>
                  {estOuvert ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {estOuvert && (
                  <div className="mini-directions">
                    {m.directions.map((d) => {
                      const membres = siens.filter((a) => a.directionId === d.id);
                      return (
                        <div key={d.id} className="mini-direction">
                          <h3>
                            <Building2 size={15} />
                            {d.nom}
                            <span>
                              {d.sigle} · {membres.length} agent(s)
                            </span>
                          </h3>
                          {membres.map((a) => (
                            <Link key={a.id} to={`/agents/${a.id}`} className="portail-ligne">
                              <AvatarAgent nom={a.nomComplet} taille={28} revoque={a.statut === "revoque"} />
                              <div className="portail-ligne-texte">
                                <strong>{a.nomComplet}</strong>
                                <span>{a.fonction}</span>
                              </div>
                              <span className={`badge-statut ${statuts[a.statut].classe}`}>{statuts[a.statut].nom}</span>
                            </Link>
                          ))}
                          {membres.length === 0 && <p className="portail-discret mini-aucun">Aucun agent enrôlé.</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
