import { useEffect, useState } from "react";
import { Check, Loader2, ShieldOff, ShieldX, X } from "lucide-react";
import AvatarAgent from "./AvatarAgent.jsx";
import { etapesRevocation, revoquerAgent } from "../api/revocations.js";
import "./Fenetre.css";
import "./FenetreRevocation.css";

const motifs = [
  "Départ du ministère",
  "Perte ou vol du téléphone professionnel",
  "Mutation hors du périmètre",
  "Suspicion de compromission du compte",
  "Fin de contrat",
  "Autre motif",
];

export default function FenetreRevocation({ agent, ministere, onFermer, onRevoque }) {
  const [phase, setPhase] = useState("consequences");
  const [motif, setMotif] = useState(motifs[0]);
  const [precision, setPrecision] = useState("");
  const [saisie, setSaisie] = useState("");
  const [faites, setFaites] = useState(0);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState("");

  const enCours = phase === "execution";

  useEffect(() => {
    function echap(e) {
      if (e.key === "Escape" && !enCours) onFermer();
    }
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [enCours, onFermer]);

  const motifFinal = motif === "Autre motif" ? precision.trim() : motif;
  const confirme = saisie.trim().toUpperCase() === agent.matricule.toUpperCase();

  async function executer() {
    setPhase("execution");
    setErreur("");
    try {
      const r = await revoquerAgent(agent.id, motifFinal);
      setResultat(r);
      for (let i = 1; i <= etapesRevocation.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        setFaites(i);
      }
      setPhase("termine");
      onRevoque(r);
    } catch (err) {
      setErreur(err.message);
      setPhase("confirmation");
    }
  }

  return (
    <div className="fenetre-fond" onClick={() => !enCours && onFermer()}>
      <div className="fenetre" role="dialog" aria-modal="true" aria-labelledby="titre-revocation" onClick={(e) => e.stopPropagation()}>
        <div className="fenetre-bande" />
        <div className="fenetre-entete">
          <div>
            <h2 id="titre-revocation">{phase === "termine" ? "Révocation effectuée" : "Révoquer les accès"}</h2>
            {phase === "consequences" && <p>Étape 1 sur 2 · Conséquences de l'opération</p>}
            {phase === "confirmation" && <p>Étape 2 sur 2 · Confirmation explicite</p>}
          </div>
          {!enCours && (
            <button type="button" className="fenetre-fermer" aria-label="Fermer" onClick={onFermer}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="fenetre-corps">
          <div className="revocation-agent">
            <AvatarAgent nom={agent.nomComplet} taille={44} revoque={phase === "termine"} />
            <div>
              <strong>{agent.nomComplet}</strong>
              <span>
                {agent.fonction} · {ministere ? ministere.sigle : ""} · <span className="mono">{agent.matricule}</span>
              </span>
            </div>
          </div>

          {erreur && <p className="portail-erreur">{erreur}</p>}

          {phase === "consequences" && (
            <>
              <h3 className="revocation-titre">Cette opération va immédiatement :</h3>
              <ul className="revocation-consequences">
                {etapesRevocation.map((e) => (
                  <li key={e.cle}>
                    <ShieldX size={16} />
                    {e.libelle}
                  </li>
                ))}
              </ul>
              <p className="revocation-avertissement">
                L'agent sera retiré de ses {agent.salons} salon(s) et déconnecté de ses {agent.appareils} appareil(s). Il ne pourra
                plus lire les nouveaux messages, y compris dans les conversations en cours.
              </p>
              <label className="champ">
                Motif de la révocation
                <select value={motif} onChange={(e) => setMotif(e.target.value)}>
                  {motifs.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              {motif === "Autre motif" && (
                <label className="champ">
                  Précision
                  <input value={precision} onChange={(e) => setPrecision(e.target.value)} placeholder="Motif consigné au journal d'audit" />
                </label>
              )}
            </>
          )}

          {phase === "confirmation" && (
            <>
              <p className="revocation-texte">
                L'opération sera consignée au journal d'audit sous votre nom, avec le motif « {motifFinal} ». Pour confirmer,
                saisissez le matricule de l'agent : <span className="revocation-matricule mono">{agent.matricule}</span>
              </p>
              <input
                className="revocation-saisie mono"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder={agent.matricule}
                aria-label="Matricule de confirmation"
                autoFocus
              />
            </>
          )}

          {(phase === "execution" || phase === "termine") && (
            <>
              <ol className="revocation-etapes">
                {etapesRevocation.map((e, i) => {
                  const echoue = i < faites && resultat?.etapes.find((x) => x.cle === e.cle)?.ok === false;
                  const fait = i < faites && !echoue;
                  const courant = phase === "execution" && i === faites;
                  return (
                    <li key={e.cle} className={echoue ? "echoue" : fait ? "fait" : courant ? "courant" : ""}>
                      <span className="revocation-puce">
                        {echoue ? <X size={13} strokeWidth={3} /> : fait ? <Check size={13} strokeWidth={3} /> : courant ? <Loader2 size={13} className="tourne" /> : i + 1}
                      </span>
                      <span className="revocation-libelle">{e.libelle}</span>
                      <span className="revocation-systeme">{e.systeme}</span>
                    </li>
                  );
                })}
              </ol>
              {phase === "termine" && resultat.etapes.some((x) => x.ok === false) && (
                <p className="portail-erreur">Une ou plusieurs étapes ont échoué côté serveur. Vérifiez le compte avant de considérer l'accès comme coupé.</p>
              )}
              {phase === "termine" && (
                <div className="revocation-bilan">
                  <div>
                    <strong>Révoqué</strong>
                    <span>Statut</span>
                  </div>
                  <div>
                    <strong>{resultat.appareils}</strong>
                    <span>Appareil(s) déconnecté(s)</span>
                  </div>
                  <div>
                    <strong>{resultat.salons}</strong>
                    <span>Salon(s) quitté(s)</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="fenetre-pied">
          {phase === "consequences" && (
            <>
              <button type="button" className="btn-outline" onClick={onFermer}>
                Annuler
              </button>
              <button type="button" className="btn-danger" disabled={!motifFinal} onClick={() => setPhase("confirmation")}>
                Continuer
              </button>
            </>
          )}
          {phase === "confirmation" && (
            <>
              <button type="button" className="btn-outline" onClick={() => setPhase("consequences")}>
                Retour
              </button>
              <button type="button" className="btn-danger" disabled={!confirme} onClick={executer}>
                <ShieldOff size={16} />
                Révoquer définitivement
              </button>
            </>
          )}
          {phase === "termine" && (
            <button type="button" className="btn-primary" onClick={onFermer}>
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
