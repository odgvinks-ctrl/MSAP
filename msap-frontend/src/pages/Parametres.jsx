import { useState } from "react";
import { Check, Languages, LogOut, RotateCcw } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import Fenetre from "../components/Fenetre.jsx";
import { changerPresence, getAnnuaire } from "../api/messagerie.js";
import { reinitialiserBase } from "../api/base.js";
import { modeDemo } from "../api/http.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLangue } from "../context/LangueContext.jsx";
import { langues, traductions } from "../data/traductions.js";
import "./Portail.css";
import "./Espace.css";
import "./Parametres.css";

const presences = ["disponible", "occupe", "absent"];

function Interrupteur({ actif, onChange, label, detail }) {
  return (
    <label className="parametres-option">
      <span>
        <strong>{label}</strong>
        {detail && <small>{detail}</small>}
      </span>
      <input type="checkbox" checked={actif} onChange={(e) => onChange(e.target.checked)} />
      <span className="parametres-interrupteur" />
    </label>
  );
}

export default function Parametres() {
  const { user, logout } = useAuth();
  const { langue, choisir, t } = useLangue();
  const [presence, setPresence] = useState("disponible");
  const [notifications, setNotifications] = useState({ sons: true, mentions: true, apercu: false });
  const [reset, setReset] = useState(false);
  const [info, setInfo] = useState("");
  const [erreur, setErreur] = useState("");

  useActualisation(async () => {
    const annuaire = await getAnnuaire();
    const moi = annuaire.agents.find((a) => a.id === user.id);
    if (moi) setPresence(moi.presence);
  }, "presence", 10000);

  async function changer(p) {
    setPresence(p);
    try {
      await changerPresence(p);
    } catch (err) {
      setErreur(err.message);
    }
  }

  const total = Object.keys(traductions.fr).length;

  return (
    <div className="portail espace">
      <div className="portail-contenu etroit">
        <div className="portail-entete">
          <h1>{t("nav.parametres")}</h1>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {info && <p className="portail-succes">{info}</p>}

        <div className="portail-carte portail-carte-corps">
          <div className="parametres-profil">
            <AvatarAgent nom={user.nomComplet} taille={56} presence={presence} />
            <span className="portail-ligne-texte">
              <strong>{user.nomComplet}</strong>
              <span>{user.fonction}</span>
              <span>
                {user.email} · {user.matricule}
              </span>
            </span>
          </div>
          <div className="parametres-presences">
            {presences.map((p) => (
              <button key={p} type="button" className={presence === p ? "actif" : ""} onClick={() => changer(p)}>
                {t(`presence.${p}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="portail-carte portail-carte-corps">
          <div className="parametres-titre">
            <span className="parametres-icone">
              <Languages size={20} />
            </span>
            <div>
              <h2>Langue de l'interface</h2>
              <p className="portail-discret">Français par défaut. Le mooré et le dioula sont en cours de traduction avec des locuteurs natifs.</p>
            </div>
          </div>
          <div className="parametres-langues">
            {langues.map((l) => {
              const traduits = Object.keys(traductions[l.id] || {}).length;
              const ratio = Math.max(4, Math.round((traduits / total) * 100));
              return (
                <button
                  key={l.id}
                  type="button"
                  className={langue === l.id ? "parametres-langue actif" : "parametres-langue"}
                  onClick={() => {
                    choisir(l.id);
                    setInfo(l.id === "fr" ? "Langue : Français" : `Langue : ${l.nom}. Les libellés non encore validés restent affichés en français.`);
                  }}
                >
                  {langue === l.id && <Check size={16} className="parametres-coche" />}
                  <strong>{l.natif}</strong>
                  <small>{l.nom}</small>
                  <span className="parametres-jauge">
                    <span className={l.id === "fr" ? "complet" : ""} style={{ width: `${ratio}%` }} />
                  </span>
                  <small>{l.id === "fr" ? "Langue de référence" : `${traduits}/${total} libellés · à valider`}</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="portail-carte portail-carte-corps">
          <h2 className="parametres-h2">Notifications</h2>
          <Interrupteur actif={notifications.sons} label="Sons des nouveaux messages" onChange={(v) => setNotifications({ ...notifications, sons: v })} />
          <Interrupteur actif={notifications.mentions} label="Notifier les mentions dans les groupes" onChange={(v) => setNotifications({ ...notifications, mentions: v })} />
          <Interrupteur
            actif={notifications.apercu}
            label="Afficher l'aperçu du message"
            detail="Désactivé par défaut : le contenu n'apparaît pas sur l'écran verrouillé. Jamais affiché pour les messages classifiés."
            onChange={(v) => setNotifications({ ...notifications, apercu: v })}
          />
        </div>

        <div className="portail-carte portail-carte-corps">
          <h2 className="parametres-h2">{modeDemo ? "Démonstration" : "Session"}</h2>
          {modeDemo && <p className="portail-discret">Les données de cette démonstration sont fictives et conservées dans ce navigateur.</p>}
          <div className="portail-actions parametres-boutons">
            {modeDemo && (
              <button type="button" className="btn-outline" onClick={() => setReset(true)}>
                <RotateCcw size={15} />
                Réinitialiser les données
              </button>
            )}
            <button type="button" className="btn-outline rouge" onClick={logout}>
              <LogOut size={15} />
              {t("commun.deconnexion")}
            </button>
          </div>
        </div>
      </div>

      {reset && (
        <Fenetre
          titre="Réinitialiser la démonstration ?"
          onFermer={() => setReset(false)}
          pied={
            <>
              <button type="button" className="btn-outline" onClick={() => setReset(false)}>
                Annuler
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  reinitialiserBase();
                  setReset(false);
                  setInfo("Données de démonstration restaurées.");
                }}
              >
                Confirmer
              </button>
            </>
          }
        >
          <p>Les messages envoyés, groupes créés, enrôlements et révocations effectués pendant la démonstration seront effacés.</p>
        </Fenetre>
      )}
    </div>
  );
}
