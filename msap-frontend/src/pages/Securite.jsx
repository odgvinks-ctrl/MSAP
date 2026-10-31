import { useState } from "react";
import { AlertTriangle, CheckCircle2, KeyRound, Laptop, LogOut, ShieldCheck, Siren, Smartphone, Tablet, XCircle } from "lucide-react";
import Fenetre from "../components/Fenetre.jsx";
import { deconnecterAppareil, getAppareils, getConnexions, signalerPerte } from "../api/messagerie.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { dateHeure, depuis } from "../utils/texte.js";
import "./Portail.css";
import "./Espace.css";
import "./Securite.css";

const icones = { ordinateur: Laptop, mobile: Smartphone, tablette: Tablet };

export default function Securite() {
  const { user } = useAuth();
  const [appareils, setAppareils] = useState([]);
  const [connexions, setConnexions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");
  const [cible, setCible] = useState(null);
  const [urgence, setUrgence] = useState(false);
  const [perdu, setPerdu] = useState("");

  async function charger() {
    try {
      const [a, c] = await Promise.all([getAppareils(), getConnexions()]);
      setAppareils(a);
      setConnexions(c);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "securite");

  const autres = appareils.filter((d) => !d.courant);
  const echecs = connexions.filter((c) => c.resultat === "echec").length;
  const tousVerifies = appareils.every((d) => d.verifie);

  async function deconnecter() {
    const ids = cible === "autres" ? autres.map((d) => d.id) : [cible.id];
    setCible(null);
    try {
      for (const id of ids) await deconnecterAppareil(id);
      await charger();
      setInfo("Appareil(s) déconnecté(s). Les sessions et clés associées ne sont plus valides.");
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function neutraliser() {
    setUrgence(false);
    try {
      await signalerPerte(perdu);
      await charger();
      setInfo("Appareil neutralisé : session révoquée et effacement demandé à sa prochaine connexion au réseau. L'administration est alertée.");
    } catch (err) {
      setErreur(err.message);
    }
  }

  const etats = [
    { ok: true, titre: "Second facteur actif", desc: "Application TOTP" },
    { ok: true, titre: "Clés de chiffrement sauvegardées", desc: "Phrase de récupération définie" },
    { ok: tousVerifies, titre: "Appareils vérifiés", desc: tousVerifies ? "Tous vos appareils sont vérifiés" : "1 appareil à vérifier" },
    { ok: echecs === 0, titre: "Tentatives suspectes", desc: echecs ? `${echecs} échec(s) récent(s)` : "Aucune" },
  ];

  const parametres = [
    { icone: KeyRound, titre: "Méthode principale", valeur: "Identifiant professionnel + code TOTP" },
    { icone: ShieldCheck, titre: "Durée maximale de session", valeur: "8 heures, puis nouvelle vérification" },
    { icone: Smartphone, titre: "Application d'authentification", valeur: "Configurée le jour de l'activation" },
  ];

  return (
    <div className="portail espace">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <h1>Centre de sécurité</h1>
            <p className="portail-sous">État de votre compte, appareils autorisés et historique des connexions.</p>
          </div>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {info && <p className="portail-succes">{info}</p>}

        <div className="securite-haut">
          <div className="portail-carte securite-etat">
            <span className="securite-bouclier">
              <ShieldCheck size={24} />
            </span>
            <div>
              <h2>
                Votre compte est protégé <span className="badge-statut valide">Actif</span>
              </h2>
              <p className="portail-sous">Dernière connexion {depuis(user.derniereConnexion)} depuis ce navigateur.</p>
              <div className="securite-etats">
                {etats.map((e) => (
                  <div key={e.titre} className="securite-ligne">
                    {e.ok ? <CheckCircle2 size={16} className="vert" /> : <AlertTriangle size={16} className="orange" />}
                    <span>
                      <strong>{e.titre}</strong>
                      <small>{e.desc}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="portail-carte securite-urgence">
            <span className="securite-sirene">
              <Siren size={20} />
            </span>
            <h2>Appareil perdu ou volé ?</h2>
            <p>Déconnectez-le immédiatement et demandez l'effacement des données MSAP qu'il contient.</p>
            <button
              type="button"
              className="btn-danger"
              disabled={autres.length === 0}
              onClick={() => {
                setPerdu(autres[0]?.id || "");
                setUrgence(true);
              }}
            >
              <Siren size={16} />
              Bouton d'urgence
            </button>
          </div>
        </div>

        <div className="portail-carte">
          <div className="portail-carte-entete">
            <div>
              <h2>Appareils connectés</h2>
              <p>{appareils.length} session(s) active(s)</p>
            </div>
            {autres.length > 0 && (
              <button type="button" className="btn-outline" onClick={() => setCible("autres")}>
                <LogOut size={15} />
                Déconnecter les autres appareils
              </button>
            )}
          </div>
          {chargement && <p className="portail-vide">Chargement…</p>}
          <div className="portail-liste">
            {appareils.map((d) => {
              const Icone = icones[d.type] || Laptop;
              return (
                <div key={d.id} className="portail-ligne securite-appareil">
                  <span className="securite-icone">
                    <Icone size={20} />
                  </span>
                  <span className="portail-ligne-texte">
                    <strong>
                      {d.nom}
                      {d.courant && <span className="badge-statut valide">Cet appareil</span>}
                      {!d.verifie && <span className="badge-statut suspendu">Non vérifié</span>}
                    </strong>
                    <span>
                      {d.navigateur} · {d.lieu} · IP {d.ip}
                    </span>
                    <span>Activité : {depuis(d.derniereActivite)}</span>
                  </span>
                  {!d.courant && (
                    <button type="button" className="btn-outline" onClick={() => setCible(d)}>
                      <LogOut size={15} />
                      Déconnecter
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="securite-bas">
          <div className="portail-carte">
            <div className="portail-carte-entete">
              <h2>Historique des connexions</h2>
            </div>
            <div className="portail-liste">
              {connexions.map((c) => (
                <div key={c.id} className="portail-ligne">
                  {c.resultat === "echec" ? <XCircle size={16} className="rouge" /> : <CheckCircle2 size={16} className="vert" />}
                  <span className="portail-ligne-texte">
                    <strong>{c.resultat === "echec" ? "Échec du second facteur" : "Connexion réussie"}</strong>
                    <span>
                      {c.appareil} · {c.lieu}
                    </span>
                  </span>
                  <span className="portail-discret">{depuis(c.date)}</span>
                </div>
              ))}
              {!chargement && connexions.length === 0 && <p className="portail-vide">Aucune connexion enregistrée.</p>}
            </div>
          </div>

          <div className="portail-carte">
            <div className="portail-carte-entete">
              <h2>Authentification</h2>
            </div>
            <div className="portail-carte-corps securite-params">
              {parametres.map((p) => {
                const Icone = p.icone;
                return (
                  <p key={p.titre}>
                    <Icone size={16} />
                    <span>
                      <small>{p.titre}</small>
                      {p.valeur}
                    </span>
                  </p>
                );
              })}
              <p className="securite-politique">Les paramètres d'authentification sont définis par la politique de sécurité de l'administration et gérés par le service d'identité.</p>
            </div>
          </div>
        </div>
      </div>

      {cible && (
        <Fenetre
          titre={cible === "autres" ? "Déconnecter les autres appareils ?" : "Déconnecter cet appareil ?"}
          sous={cible === "autres" ? `${autres.length} appareil(s) concerné(s)` : cible.nom}
          onFermer={() => setCible(null)}
          pied={
            <>
              <button type="button" className="btn-outline" onClick={() => setCible(null)}>
                Annuler
              </button>
              <button type="button" className="btn-danger" onClick={deconnecter}>
                <LogOut size={15} />
                Déconnecter
              </button>
            </>
          }
        >
          <p>La session sera fermée et l'appareil devra repasser par l'authentification forte pour accéder à nouveau à MSAP.</p>
        </Fenetre>
      )}

      {urgence && (
        <Fenetre
          danger
          titre="Bouton d'urgence"
          sous="Signalez un appareil perdu ou volé."
          onFermer={() => setUrgence(false)}
          pied={
            <>
              <button type="button" className="btn-outline" onClick={() => setUrgence(false)}>
                Annuler
              </button>
              <button type="button" className="btn-danger" disabled={!perdu} onClick={neutraliser}>
                <Siren size={15} />
                Neutraliser l'appareil
              </button>
            </>
          }
        >
          <div className="securite-choix">
            {autres.map((d) => {
              const Icone = icones[d.type] || Laptop;
              return (
                <button key={d.id} type="button" className={perdu === d.id ? "securite-option actif" : "securite-option"} onClick={() => setPerdu(d.id)}>
                  <Icone size={20} />
                  <span className="portail-ligne-texte">
                    <strong>{d.nom}</strong>
                    <span>Dernière activité : {dateHeure(d.derniereActivite)}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <ul className="securite-consequences">
            <li>· La session de l'appareil est révoquée immédiatement.</li>
            <li>· L'application efface ses données locales dès qu'elle se reconnecte.</li>
            <li>· Un administrateur est alerté.</li>
          </ul>
        </Fenetre>
      )}
    </div>
  );
}
