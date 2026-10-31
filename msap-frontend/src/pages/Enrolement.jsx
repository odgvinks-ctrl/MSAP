import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ClipboardCopy, KeyRound, ShieldCheck, UserPlus, Users } from "lucide-react";
import { enrolerAgent } from "../api/agents.js";
import { getMinisteres } from "../api/ministeres.js";
import { useAuth } from "../context/AuthContext.jsx";
import { roles } from "../data/roles.js";
import "./Portail.css";
import "./Enrolement.css";

const vide = {
  prenom: "",
  nom: "",
  matricule: "",
  telephone: "",
  ministereId: "",
  directionId: "",
  fonction: "",
  email: "",
  role: "agent",
};

function simplifier(texte) {
  return texte.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/gi, "").toLowerCase();
}

function valider(form) {
  const erreurs = {};
  if (form.nom.trim().length < 2) erreurs.nom = "Le nom est obligatoire.";
  if (form.prenom.trim().length < 2) erreurs.prenom = "Le prénom est obligatoire.";
  if (!/^AGT-\d{4}-\d{4}$/i.test(form.matricule.trim())) erreurs.matricule = "Format attendu : AGT-AAAA-NNNN.";
  if (!form.ministereId) erreurs.ministereId = "Choisissez un ministère.";
  if (!form.directionId) erreurs.directionId = "Choisissez une direction.";
  if (form.fonction.trim().length < 3) erreurs.fonction = "La fonction est obligatoire.";
  if (!/^[^\s@]+@[a-z0-9-]+\.msap\.demo$/i.test(form.email.trim())) erreurs.email = "Adresse professionnelle attendue (prenom.nom@ministere.msap.demo).";
  return erreurs;
}

export default function Enrolement() {
  const { user } = useAuth();
  const [ministeres, setMinisteres] = useState([]);
  const [form, setForm] = useState(vide);
  const [essai, setEssai] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resultat, setResultat] = useState(null);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    getMinisteres()
      .then((liste) => setMinisteres(user.role === "super_admin" ? liste : liste.filter((m) => m.id === user.ministereId)))
      .catch((err) => setErreur(err.message));
  }, [user]);

  const ministere = ministeres.find((m) => m.id === form.ministereId);
  const erreurs = valider(form);
  const rolesPossibles = user.role === "super_admin" ? roles : roles.filter((r) => r.id !== "super_admin");

  function proposerAdresse(suivant) {
    if (!suivant.prenom || !suivant.nom || !suivant.ministereId) return suivant.email;
    return `${simplifier(suivant.prenom)[0]}.${simplifier(suivant.nom)}@${suivant.ministereId}.msap.demo`;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const suivant = { ...form, [name]: value };
    if (name === "ministereId") suivant.directionId = "";
    if (["prenom", "nom", "ministereId"].includes(name) && (!form.email || form.email === proposerAdresse(form))) {
      suivant.email = proposerAdresse(suivant);
    }
    setForm(suivant);
    setErreur("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEssai(true);
    if (Object.keys(erreurs).length) return;
    setChargement(true);
    try {
      setResultat(await enrolerAgent(form));
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  async function copier() {
    try {
      await navigator.clipboard.writeText(resultat.codeActivation);
      setCopie(true);
    } catch {
      setCopie(false);
    }
  }

  function recommencer() {
    setForm(vide);
    setEssai(false);
    setResultat(null);
    setCopie(false);
  }

  const champ = (nom) => (essai && erreurs[nom] ? "champ invalide" : "champ");

  if (resultat) {
    return (
      <section className="portail">
        <div className="portail-contenu enrole">
          <div className="portail-carte enrole-carte">
            <div className="enrole-haut">
              <span className="enrole-coche">
                <Check size={28} strokeWidth={2.5} />
              </span>
              <h1>Agent enrôlé</h1>
              <p>{resultat.agent.nomComplet} peut maintenant activer son compte.</p>
            </div>
            <div className="enrole-corps">
              <span className="label">Code d'activation à usage unique</span>
              <div className="enrole-code">
                <span className="mono">{resultat.codeActivation}</span>
                <button type="button" className="btn-outline" onClick={copier}>
                  <ClipboardCopy size={15} />
                  {copie ? "Copié" : "Copier"}
                </button>
              </div>
              <p className="portail-discret">
                Valable {resultat.expireDansHeures} heures. À la première connexion, l'agent configure son second facteur et ses clés de
                chiffrement sont générées sur son appareil.
              </p>
              <div className="portail-actions">
                <button type="button" className="btn-outline" onClick={recommencer}>
                  <UserPlus size={15} />
                  Nouvel enrôlement
                </button>
                <Link to={`/agents/${resultat.agent.id}`} className="btn-primary">
                  <Users size={15} />
                  Voir la fiche de l'agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="portail">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <span className="label">Identités</span>
            <h1>Enrôlement d'un agent</h1>
            <p className="portail-sous">Seuls les agents enrôlés par un administrateur peuvent accéder à MSAP. Aucune inscription libre n'est possible.</p>
          </div>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}

        <form className="enrole-grille" onSubmit={handleSubmit} noValidate>
          <div className="enrole-blocs">
            <div className="portail-carte enrole-bloc">
              <h2>
                <span>1</span>Identité
              </h2>
              <div className="enrole-champs">
                <label className={champ("nom")}>
                  Nom
                  <input name="nom" value={form.nom} onChange={handleChange} placeholder="Sawadogo" />
                  {essai && erreurs.nom && <span className="champ-erreur">{erreurs.nom}</span>}
                </label>
                <label className={champ("prenom")}>
                  Prénom
                  <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Awa" />
                  {essai && erreurs.prenom && <span className="champ-erreur">{erreurs.prenom}</span>}
                </label>
                <label className={champ("matricule")}>
                  Identifiant administratif (fictif)
                  <input name="matricule" className="mono" value={form.matricule} onChange={handleChange} placeholder="AGT-2026-0000" />
                  {essai && erreurs.matricule && <span className="champ-erreur">{erreurs.matricule}</span>}
                </label>
                <label className="champ">
                  Téléphone de bureau
                  <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+226 25 00 00 00" />
                </label>
              </div>
            </div>

            <div className="portail-carte enrole-bloc">
              <h2>
                <span>2</span>Rattachement administratif
              </h2>
              <div className="enrole-champs">
                <label className={champ("ministereId")}>
                  Ministère
                  <select name="ministereId" value={form.ministereId} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {ministeres.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.sigle} · {m.nom}
                      </option>
                    ))}
                  </select>
                  {essai && erreurs.ministereId && <span className="champ-erreur">{erreurs.ministereId}</span>}
                </label>
                <label className={champ("directionId")}>
                  Direction
                  <select name="directionId" value={form.directionId} onChange={handleChange} disabled={!ministere}>
                    <option value="">{ministere ? "Sélectionner" : "Choisir d'abord un ministère"}</option>
                    {ministere?.directions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.sigle} · {d.nom}
                      </option>
                    ))}
                  </select>
                  {essai && erreurs.directionId && <span className="champ-erreur">{erreurs.directionId}</span>}
                </label>
                <label className={champ("fonction")}>
                  Fonction
                  <input name="fonction" value={form.fonction} onChange={handleChange} placeholder="Cheffe du service courrier" />
                  {essai && erreurs.fonction && <span className="champ-erreur">{erreurs.fonction}</span>}
                </label>
                <label className={champ("email")}>
                  Adresse professionnelle
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="prenom.nom@ministere.msap.demo" />
                  {essai && erreurs.email && <span className="champ-erreur">{erreurs.email}</span>}
                </label>
              </div>
            </div>

            <div className="portail-carte enrole-bloc">
              <h2>
                <span>3</span>Rôle
              </h2>
              <div className="enrole-roles">
                {rolesPossibles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={form.role === r.id ? "enrole-role actif" : "enrole-role"}
                    onClick={() => setForm({ ...form, role: r.id })}
                  >
                    <strong>{r.nom}</strong>
                    <span>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="portail-carte enrole-recap">
            <h2>Récapitulatif</h2>
            <dl>
              <div>
                <dt>Agent</dt>
                <dd>{form.prenom || form.nom ? `${form.prenom} ${form.nom}` : "—"}</dd>
              </div>
              <div>
                <dt>Matricule</dt>
                <dd className="mono">{form.matricule || "—"}</dd>
              </div>
              <div>
                <dt>Ministère</dt>
                <dd>{ministere ? ministere.sigle : "—"}</dd>
              </div>
              <div>
                <dt>Direction</dt>
                <dd>{ministere?.directions.find((d) => d.id === form.directionId)?.sigle || "—"}</dd>
              </div>
              <div>
                <dt>Rôle</dt>
                <dd>{roles.find((r) => r.id === form.role)?.nom}</dd>
              </div>
            </dl>
            <ul className="enrole-garanties">
              <li>
                <ShieldCheck size={15} />
                Compte créé dans le service d'identité
              </li>
              <li>
                <KeyRound size={15} />
                Second facteur obligatoire à l'activation
              </li>
              <li>
                <Users size={15} />
                Visible dans l'annuaire après activation
              </li>
            </ul>
            <button type="submit" className="btn-primary enrole-bouton" disabled={chargement}>
              {chargement ? "Enrôlement..." : "Enrôler l'agent"}
              {!chargement && <ArrowRight size={16} />}
            </button>
            {essai && Object.keys(erreurs).length > 0 && <p className="champ-erreur">{Object.keys(erreurs).length} champ(s) à corriger.</p>}
          </aside>
        </form>
      </div>
    </section>
  );
}
