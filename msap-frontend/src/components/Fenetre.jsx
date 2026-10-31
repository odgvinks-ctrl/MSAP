import { useEffect } from "react";
import { X } from "lucide-react";
import "./Fenetre.css";

export default function Fenetre({ titre, sous, onFermer, pied, danger = false, large = false, children }) {
  useEffect(() => {
    function echap(e) {
      if (e.key === "Escape") onFermer();
    }
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [onFermer]);

  return (
    <div className="fenetre-fond" onClick={onFermer}>
      <div className={large ? "fenetre large" : "fenetre"} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {danger && <div className="fenetre-bande" />}
        <div className="fenetre-entete">
          <div>
            <h2>{titre}</h2>
            {sous && <p>{sous}</p>}
          </div>
          <button type="button" className="fenetre-fermer" aria-label="Fermer" onClick={onFermer}>
            <X size={20} />
          </button>
        </div>
        <div className="fenetre-corps">{children}</div>
        {pied && <div className="fenetre-pied">{pied}</div>}
      </div>
    </div>
  );
}
