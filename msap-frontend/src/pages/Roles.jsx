import { Fragment, useEffect, useState } from "react";
import { Check, Minus } from "lucide-react";
import { getAgents } from "../api/agents.js";
import { roles } from "../data/roles.js";
import "./Portail.css";
import "./Roles.css";

const permissions = [
  {
    domaine: "Messagerie",
    lignes: [
      { nom: "Envoyer des messages et des fichiers chiffrés", droits: [true, true, true, true] },
      { nom: "Émettre un message Confidentiel", droits: [true, true, true, true] },
      { nom: "Créer un groupe", droits: [true, true, true, true] },
      { nom: "Ajouter ou retirer des participants", droits: [true, "Son ministère", "Ses groupes", false] },
      { nom: "Lire les messages des autres agents", droits: [false, false, false, false], interdit: true },
    ],
  },
  {
    domaine: "Identités",
    lignes: [
      { nom: "Enrôler un agent", droits: [true, "Son ministère", false, false] },
      { nom: "Suspendre ou réactiver un compte", droits: [true, "Son ministère", false, false] },
      { nom: "Révoquer les accès d'un agent", droits: [true, "Son ministère", false, false] },
      { nom: "Attribuer un rôle d'administrateur", droits: [true, false, false, false] },
    ],
  },
  {
    domaine: "Gouvernance",
    lignes: [
      { nom: "Consulter le journal d'audit", droits: [true, "Son ministère", false, false] },
      { nom: "Gérer les ministères et directions", droits: [true, false, false, false] },
      { nom: "Modifier les règles de classification", droits: [true, false, false, false] },
    ],
  },
];

function Cellule({ valeur }) {
  if (valeur === true) {
    return (
      <span className="roles-oui">
        <Check size={13} strokeWidth={3} />
      </span>
    );
  }
  if (valeur === false) return <Minus size={16} className="roles-non" />;
  return <span className="roles-portee">{valeur}</span>;
}

export default function Roles() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    getAgents().then(setAgents).catch(() => setAgents([]));
  }, []);

  const effectif = (role) => agents.filter((a) => a.role === role && a.statut !== "revoque").length;

  return (
    <section className="portail">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <span className="label">Gouvernance</span>
            <h1>Rôles et permissions</h1>
            <p className="portail-sous">
              Principe du moindre privilège : aucun rôle, même administrateur, ne peut lire le contenu des messages.
            </p>
          </div>
        </div>

        <div className="roles-cartes">
          {roles.map((r) => (
            <div key={r.id} className="portail-carte roles-carte">
              <strong>{r.nom}</strong>
              <span className="roles-nombre">{effectif(r.id)}</span>
              <span className="portail-discret">{r.desc}</span>
            </div>
          ))}
        </div>

        <div className="portail-carte portail-tableau">
          <table className="roles-tableau">
            <thead>
              <tr>
                <th>Permission</th>
                {roles.map((r) => (
                  <th key={r.id}>{r.nom}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <Fragment key={p.domaine}>
                  <tr className="roles-domaine">
                    <td colSpan={roles.length + 1}>{p.domaine}</td>
                  </tr>
                  {p.lignes.map((l) => (
                    <tr key={l.nom} className={l.interdit ? "roles-interdit" : ""}>
                      <td>{l.nom}</td>
                      {l.droits.map((d, i) => (
                        <td key={roles[i].id}>
                          <Cellule valeur={d} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <p className="portail-discret">
          Les rôles sont portés par le service d'identité (Keycloak) et transmis à la messagerie à chaque connexion. Toute modification est
          consignée au journal d'audit.
        </p>
      </div>
    </section>
  );
}
