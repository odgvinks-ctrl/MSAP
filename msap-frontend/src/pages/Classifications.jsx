import { useEffect, useState } from "react";
import { Info, Save } from "lucide-react";
import { enregistrerRegle, getRegles } from "../api/classifications.js";
import { useAuth } from "../context/AuthContext.jsx";
import { durees, niveaux } from "../data/niveaux.js";
import { duree } from "../utils/texte.js";
import "./Portail.css";
import "./Classifications.css";

const options = [
  { cle: "transfertInterdit", nom: "Transfert interdit", desc: "Le message ne peut pas être transféré vers une autre conversation." },
  { cle: "copieInterdite", nom: "Copie du texte interdite", desc: "La sélection et la copie sont désactivées dans l'application." },
  { cle: "accuseLecture", nom: "Accusé de lecture obligatoire", desc: "Chaque destinataire confirme sa prise de connaissance, horodatée." },
  { cle: "filigrane", nom: "Filigrane nominatif", desc: "Le nom du lecteur s'affiche en filigrane sur les pièces jointes." },
];

export default function Classifications() {
  const { user } = useAuth();
  const [regles, setRegles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");
  const [enCours, setEnCours] = useState("");

  const modifiable = user.role === "super_admin";

  useEffect(() => {
    getRegles()
      .then(setRegles)
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  function changer(id, cle, valeur) {
    setRegles(regles.map((r) => (r.id === id ? { ...r, [cle]: valeur } : r)));
    setInfo("");
  }

  async function enregistrer(regle) {
    setEnCours(regle.id);
    try {
      const sauvee = await enregistrerRegle(regle);
      setRegles(regles.map((r) => (r.id === sauvee.id ? sauvee : r)));
      setInfo(`Règles du niveau « ${niveaux.find((n) => n.id === regle.id).nom} » enregistrées.`);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnCours("");
    }
  }

  return (
    <section className="portail">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <span className="label">Innovation · Sécurité</span>
            <h1>Règles de classification</h1>
            <p className="portail-sous">
              Chaque message envoyé dans la messagerie porte un niveau de classification. Les règles définies ici s'appliquent à tous les
              salons.
            </p>
          </div>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {info && <p className="portail-succes">{info}</p>}
        {!modifiable && <p className="classif-note">Consultation seule : seul un super administrateur peut modifier ces règles.</p>}
        {chargement && <p className="portail-vide">Chargement...</p>}

        <div className="classif-grille">
          {regles.map((regle) => {
            const niveau = niveaux.find((n) => n.id === regle.id);
            const Icone = niveau.icone;
            return (
              <article key={regle.id} className={`portail-carte classif-carte ${regle.id}`}>
                <div className="classif-haut">
                  <span className={`badge-niveau ${regle.id}`}>
                    <Icone size={13} />
                    {niveau.nom}
                  </span>
                  <span className="portail-discret">{duree(regle.dureeMinutes)}</span>
                </div>
                <p className="classif-desc">{niveau.desc}</p>

                <label className="champ">
                  Expiration automatique
                  <select
                    value={regle.dureeMinutes}
                    disabled={!modifiable}
                    onChange={(e) => changer(regle.id, "dureeMinutes", Number(e.target.value))}
                  >
                    {durees.map((d) => (
                      <option key={d.minutes} value={d.minutes}>
                        {d.nom}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="classif-options">
                  {options.map((o) => (
                    <label key={o.cle} className="classif-option">
                      <input
                        type="checkbox"
                        checked={regle[o.cle]}
                        disabled={!modifiable}
                        onChange={(e) => changer(regle.id, o.cle, e.target.checked)}
                      />
                      <span className="classif-interrupteur" />
                      <span className="classif-option-texte">
                        <strong>{o.nom}</strong>
                        <span>{o.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>

                {modifiable && (
                  <button type="button" className="btn-primary" disabled={enCours === regle.id} onClick={() => enregistrer(regle)}>
                    <Save size={15} />
                    {enCours === regle.id ? "Enregistrement..." : "Enregistrer"}
                  </button>
                )}
              </article>
            );
          })}
        </div>

        <p className="classif-limite">
          <Info size={15} />
          Les restrictions sont appliquées par les applications MSAP et par le serveur. Elles ne peuvent pas empêcher une photo de l'écran
          prise avec un autre appareil : la responsabilité de l'agent destinataire reste engagée.
        </p>
      </div>
    </section>
  );
}
