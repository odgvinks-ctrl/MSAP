import { Download, ShieldCheck } from "lucide-react";
import Fenetre from "../Fenetre.jsx";
import { nomType } from "../../data/fichiers.js";

function Page({ piece }) {
  const titre = piece.nom.replace(/\.[a-z]+$/, "").replace(/_/g, " ");
  if (piece.type === "xlsx") {
    const lignes = [
      ["Hébergement souverain", "120 000 000", "145 000 000", "+20,8 %"],
      ["Formation des agents", "35 000 000", "52 000 000", "+48,6 %"],
      ["Sécurité opérationnelle", "48 000 000", "61 000 000", "+27,1 %"],
      ["Total", "203 000 000", "258 000 000", "+27,1 %"],
    ];
    return (
      <table className="apercu-tableur">
        <thead>
          <tr>
            <th>Poste</th>
            <th>2026</th>
            <th>2027</th>
            <th>Écart</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr key={l[0]}>
              {l.map((c, i) => (
                <td key={i}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return (
    <div className="apercu-page">
      <div className="apercu-page-haut">
        <span>Administration publique · Document de démonstration</span>
        <span>Page 1/{piece.pages || 1}</span>
      </div>
      <h3>{titre}</h3>
      {[100, 96, 92, 98, 70, 94, 99, 88, 60].map((largeur, i) => (
        <span key={i} className="apercu-ligne" style={{ width: `${largeur}%` }} />
      ))}
    </div>
  );
}

export default function ApercuFichier({ message, auteur, nomLecteur, onFermer }) {
  const piece = message.piece;
  const confidentiel = message.classification === "confidentiel";
  return (
    <Fenetre
      large
      titre={piece.nom}
      sous={`${nomType(piece.type)} · ${piece.taille}${piece.pages ? ` · ${piece.pages} pages` : ""}${auteur ? ` · partagé par ${auteur}` : ""}`}
      onFermer={onFermer}
      pied={
        <>
          <button type="button" className="btn-outline" onClick={onFermer}>
            Fermer
          </button>
          <button type="button" className="btn-primary" disabled={confidentiel} onClick={onFermer}>
            <Download size={15} />
            {confidentiel ? "Téléchargement désactivé" : "Télécharger"}
          </button>
        </>
      }
    >
      <p className="apercu-chiffre">
        <ShieldCheck size={15} />
        Fichier chiffré de bout en bout, déchiffré sur cet appareil.
      </p>
      <div className="apercu-fond">
        <Page piece={piece} />
        {confidentiel && <span className="apercu-filigrane">Confidentiel · {nomLecteur}</span>}
      </div>
      <p className="portail-discret">Aperçu de démonstration. Dans le produit, le fichier est déchiffré localement sur l'appareil du destinataire.</p>
    </Fenetre>
  );
}
