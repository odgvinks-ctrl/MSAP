import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Clock3, Lock, UsersRound } from "lucide-react";
import Fenetre from "../Fenetre.jsx";
import AvatarAgent from "../AvatarAgent.jsx";
import { duree } from "../../utils/texte.js";

const durees = [
  { minutes: 1, nom: "1 min", note: "démo" },
  { minutes: 60, nom: "1 heure" },
  { minutes: 1440, nom: "24 heures" },
  { minutes: 10080, nom: "7 jours" },
];

export default function PanneauClassification({ membres, initial, onValider, onFermer }) {
  const [regles, setRegles] = useState(initial);
  const [etape, setEtape] = useState("regles");

  function basculer(id) {
    const liste = regles.destinataires.includes(id) ? regles.destinataires.filter((d) => d !== id) : [...regles.destinataires, id];
    setRegles({ ...regles, destinataires: liste });
  }

  const tous = regles.destinataires.length === membres.length;
  const valide = regles.destinataires.length > 0;

  const options = [
    { cle: "copieInterdite", nom: "Copie du texte interdite", desc: "Sélection et copie désactivées dans l'application" },
    { cle: "accuseObligatoire", nom: "Accusé de lecture obligatoire", desc: "Chaque destinataire confirme sa prise de connaissance, horodatée" },
    { cle: "lectureUnique", nom: "Lecture unique", desc: "Le message s'efface après la première consultation" },
  ];

  return (
    <Fenetre
      titre={
        <span className="classif-titre">
          <span>
            <Lock size={16} />
          </span>
          Message confidentiel
        </span>
      }
      sous={etape === "regles" ? "Définissez qui peut lire ce message et pendant combien de temps." : "Vérifiez les restrictions avant l'envoi."}
      onFermer={onFermer}
      pied={
        etape === "regles" ? (
          <>
            <button type="button" className="btn-outline" onClick={onFermer}>
              Annuler
            </button>
            <button type="button" className="btn-primary" disabled={!valide} onClick={() => setEtape("apercu")}>
              Prévisualiser les restrictions
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn-outline" onClick={() => setEtape("regles")}>
              Modifier
            </button>
            <button type="button" className="btn-danger" onClick={() => onValider(regles)}>
              <Lock size={15} />
              Appliquer au message
            </button>
          </>
        )
      }
    >
      {etape === "regles" ? (
        <div className="classif-panneau">
          <section>
            <div className="classif-section-haut">
              <h3>
                <UsersRound size={15} />
                Destinataires autorisés
              </h3>
              <button type="button" onClick={() => setRegles({ ...regles, destinataires: tous ? [] : membres.map((a) => a.id) })}>
                {tous ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>
            <div className="classif-destinataires">
              {membres.map((a) => {
                const coche = regles.destinataires.includes(a.id);
                return (
                  <button key={a.id} type="button" className={coche ? "classif-dest actif" : "classif-dest"} onClick={() => basculer(a.id)}>
                    <span className="classif-case">{coche && <Check size={12} strokeWidth={3} />}</span>
                    <AvatarAgent nom={a.nomComplet} taille={28} />
                    <span className="classif-dest-texte">
                      <strong>{a.nomComplet}</strong>
                      <span>{a.fonction}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {!valide && <p className="champ-erreur">Sélectionnez au moins un destinataire.</p>}
          </section>

          <section>
            <h3>
              <Clock3 size={15} />
              Durée de validité
            </h3>
            <div className="classif-durees">
              {durees.map((d) => (
                <button key={d.minutes} type="button" className={regles.dureeMinutes === d.minutes ? "classif-duree actif" : "classif-duree"} onClick={() => setRegles({ ...regles, dureeMinutes: d.minutes })}>
                  <strong>{d.nom}</strong>
                  <span>{d.note || "puis expiration"}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3>Règles de consultation</h3>
            <label className="classif-option verrouille">
              <input type="checkbox" checked readOnly />
              <span className="classif-interrupteur" />
              <span className="classif-option-texte">
                <strong>Transfert interdit</strong>
                <span>Imposé par la classification Confidentiel</span>
              </span>
            </label>
            {options.map((o) => (
              <label key={o.cle} className="classif-option">
                <input type="checkbox" checked={regles[o.cle]} onChange={(e) => setRegles({ ...regles, [o.cle]: e.target.checked })} />
                <span className="classif-interrupteur" />
                <span className="classif-option-texte">
                  <strong>{o.nom}</strong>
                  <span>{o.desc}</span>
                </span>
              </label>
            ))}
          </section>
        </div>
      ) : (
        <div className="classif-panneau">
          <div className="classif-apercu">
            <div className="classif-apercu-haut">
              <span className="badge-niveau confidentiel">
                <Lock size={12} />
                Confidentiel
              </span>
              <span>Expire dans {duree(regles.dureeMinutes)}</span>
            </div>
            <ul>
              <li>
                <CheckCircle2 size={15} />
                Lisible uniquement par : {membres.filter((a) => regles.destinataires.includes(a.id)).map((a) => a.nomComplet).join(", ")}
              </li>
              <li>
                <CheckCircle2 size={15} />
                Transfert impossible depuis MSAP
              </li>
              {regles.copieInterdite && (
                <li>
                  <CheckCircle2 size={15} />
                  Copie du texte désactivée
                </li>
              )}
              {regles.accuseObligatoire && (
                <li>
                  <CheckCircle2 size={15} />
                  Accusé de lecture horodaté exigé
                </li>
              )}
              {regles.lectureUnique && (
                <li>
                  <CheckCircle2 size={15} />
                  Effacement après la première lecture
                </li>
              )}
              <li>
                <CheckCircle2 size={15} />
                Effacement automatique sur tous les appareils à l'expiration
              </li>
            </ul>
          </div>
          <p className="classif-limite">
            <AlertTriangle size={15} />
            Ces règles sont appliquées par les applications MSAP et le serveur. Elles ne peuvent pas empêcher la photo d'un écran prise avec un autre
            appareil : la responsabilité de l'agent destinataire reste engagée.
          </p>
        </div>
      )}
    </Fenetre>
  );
}
