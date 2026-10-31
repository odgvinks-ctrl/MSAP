import { useState } from "react";
import { Check, Search } from "lucide-react";
import AvatarAgent from "../AvatarAgent.jsx";
import { contient } from "../../utils/texte.js";

export default function SelecteurAgents({ agents, ministeres, selection, exclus, onChange }) {
  const [recherche, setRecherche] = useState("");
  const liste = agents.filter((a) => a.statut === "actif" && !exclus.includes(a.id) && (!recherche || contient(`${a.nomComplet} ${a.fonction}`, recherche)));
  const sigle = (id) => ministeres.find((m) => m.id === id)?.sigle;

  function basculer(id) {
    onChange(selection.includes(id) ? selection.filter((x) => x !== id) : [...selection, id]);
  }

  return (
    <div className="selecteur">
      <label className="portail-recherche">
        <Search size={16} />
        <input value={recherche} placeholder="Rechercher un agent" onChange={(e) => setRecherche(e.target.value)} />
      </label>
      <div className="selecteur-liste">
        {liste.map((a) => {
          const coche = selection.includes(a.id);
          return (
            <button key={a.id} type="button" className={coche ? "selecteur-ligne actif" : "selecteur-ligne"} onClick={() => basculer(a.id)}>
              <span className="selecteur-case">{coche && <Check size={12} strokeWidth={3} />}</span>
              <AvatarAgent nom={a.nomComplet} taille={26} />
              <span>
                <strong>{a.nomComplet}</strong> · {sigle(a.ministereId)}
              </span>
            </button>
          );
        })}
        {liste.length === 0 && <p className="portail-vide">Aucun agent disponible.</p>}
      </div>
    </div>
  );
}
