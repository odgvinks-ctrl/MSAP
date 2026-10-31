import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, MessageSquareText, Plus, UserMinus, UserPlus, UsersRound } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import AvatarGroupe from "../components/AvatarGroupe.jsx";
import Fenetre from "../components/Fenetre.jsx";
import SelecteurAgents from "../components/Messagerie/SelecteurAgents.jsx";
import { basculerResponsable, creerGroupe, getAnnuaire, getConversations, modifierMembres } from "../api/messagerie.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { niveaux } from "../data/niveaux.js";
import { horodatage } from "../utils/texte.js";
import { categories } from "../utils/conversations.js";
import "./Portail.css";
import "./Espace.css";
import "../components/Messagerie/Chat.css";

const vide = { titre: "", description: "", categorie: "travail", classification: "standard", membres: [] };

export default function Groupes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groupes, setGroupes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [ministeres, setMinisteres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [creation, setCreation] = useState(false);
  const [form, setForm] = useState(vide);
  const [essai, setEssai] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [ajout, setAjout] = useState(false);
  const [selection, setSelection] = useState([]);
  const [retrait, setRetrait] = useState(null);

  async function charger() {
    try {
      const [c, annuaire] = await Promise.all([getConversations(), getAnnuaire()]);
      setGroupes(c.filter((x) => x.type === "groupe"));
      setAgents(annuaire.agents);
      setMinisteres(annuaire.ministeres);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "groupes");

  async function agir(action, message) {
    try {
      await action();
      await charger();
      setInfo(message);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function creer() {
    setEssai(true);
    if (form.titre.trim().length < 3 || form.membres.length === 0) return;
    try {
      const g = await creerGroupe({ ...form, titre: form.titre.trim(), description: form.description.trim() });
      fermerCreation();
      navigate(`/messages/${g.id}`);
    } catch (err) {
      setErreur(err.message);
    }
  }

  function fermerCreation() {
    setCreation(false);
    setForm(vide);
    setEssai(false);
  }

  function fermerDetail() {
    setDetailId(null);
    setAjout(false);
    setSelection([]);
  }

  const affiches = groupes.filter((g) => filtre === "tous" || g.categorie === filtre);
  const detail = groupes.find((g) => g.id === detailId);
  const agent = (id) => agents.find((a) => a.id === id);
  const sigle = (id) => ministeres.find((m) => m.id === id)?.sigle;
  const responsable = detail && detail.membres.some((m) => m.agentId === user.id && m.role === "responsable");
  const aRetirer = agent(retrait);
  const filtres = [["tous", "Tous"], ...Object.entries(categories)];

  return (
    <div className="portail espace">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <h1>Groupes institutionnels</h1>
            <p className="portail-sous">Salons ministériels, de direction, interministériels, de projet et de travail.</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => setCreation(true)}>
            <Plus size={16} />
            Créer un groupe
          </button>
        </div>

        <div className="espace-filtres">
          {filtres.map(([id, nom]) => (
            <button key={id} type="button" className={filtre === id ? "actif" : ""} onClick={() => setFiltre(id)}>
              {nom}
            </button>
          ))}
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {info && <p className="portail-succes">{info}</p>}
        {chargement && <p className="portail-vide">Chargement des groupes…</p>}
        {!chargement && affiches.length === 0 && (
          <div className="portail-carte portail-vide">
            <UsersRound size={28} />
            <p>Aucun groupe dans cette catégorie.</p>
          </div>
        )}

        <div className="groupes-grille">
          {affiches.map((g) => {
            const chef = agent(g.membres.find((m) => m.role === "responsable")?.agentId);
            const niveau = niveaux.find((n) => n.id === g.classification);
            return (
              <article key={g.id} className={`portail-carte groupe-carte ${g.classification}`}>
                <div className="groupe-haut">
                  <AvatarGroupe titre={g.titre} classification={g.classification} taille={44} />
                  <div>
                    <h3>{g.titre}</h3>
                    <span>{categories[g.categorie] || "Groupe de travail"}</span>
                  </div>
                  <span className={`badge-niveau ${g.classification}`}>{niveau.court}</span>
                </div>
                <p className="groupe-description">{g.description}</p>
                <div className="groupe-membres">
                  <div className="groupe-pile">
                    {g.membres.slice(0, 5).map((m) => (
                      <AvatarAgent key={m.agentId} nom={agent(m.agentId)?.nomComplet || "?"} taille={26} />
                    ))}
                    {g.membres.length > 5 && <span className="groupe-plus">+{g.membres.length - 5}</span>}
                  </div>
                  <small>{g.dernier && `Actif ${horodatage(g.dernier.date).toLowerCase()}`}</small>
                </div>
                <p className="portail-discret">Responsable : {chef ? chef.nomComplet : "—"}</p>
                <div className="groupe-actions">
                  <button type="button" className="btn-outline" onClick={() => setDetailId(g.id)}>
                    Gérer
                  </button>
                  <button type="button" className="btn-primary" onClick={() => navigate(`/messages/${g.id}`)}>
                    <MessageSquareText size={15} />
                    Ouvrir
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {creation && (
        <Fenetre
          large
          titre="Créer un groupe"
          sous="Vous en serez le responsable. Les clés de chiffrement sont générées sur les appareils des membres."
          onFermer={fermerCreation}
          pied={
            <>
              <button type="button" className="btn-outline" onClick={fermerCreation}>
                Annuler
              </button>
              <button type="button" className="btn-primary" onClick={creer}>
                <Plus size={15} />
                Créer le groupe
              </button>
            </>
          }
        >
          <div className="groupe-form">
            <div className="groupe-form-col">
              <label>
                <span className="label">Nom du groupe</span>
                <input
                  className={essai && form.titre.trim().length < 3 ? "champ invalide" : "champ"}
                  value={form.titre}
                  placeholder="Ex. Task force état civil numérique"
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                />
                {essai && form.titre.trim().length < 3 && <span className="champ-erreur">Le nom doit comporter au moins 3 caractères.</span>}
              </label>
              <label>
                <span className="label">Description</span>
                <input className="champ" value={form.description} placeholder="Objet du groupe" onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label>
                <span className="label">Catégorie</span>
                <select className="champ" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
                  {Object.entries(categories).map(([id, nom]) => (
                    <option key={id} value={id}>
                      {nom}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <span className="label">Classification du salon</span>
                <div className="groupe-niveaux">
                  {niveaux.map((n) => (
                    <button key={n.id} type="button" className={form.classification === n.id ? "groupe-niveau actif" : "groupe-niveau"} onClick={() => setForm({ ...form, classification: n.id })}>
                      <span className="groupe-radio" />
                      <span>
                        <span className={`badge-niveau ${n.id}`}>{n.nom}</span>
                        <small>{n.desc}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <span className="label">Participants ({form.membres.length})</span>
              <SelecteurAgents agents={agents} ministeres={ministeres} selection={form.membres} exclus={[user.id]} onChange={(membres) => setForm({ ...form, membres })} />
              {essai && form.membres.length === 0 && <span className="champ-erreur">Ajoutez au moins un participant.</span>}
            </div>
          </div>
        </Fenetre>
      )}

      {detail && (
        <Fenetre titre="Gestion du groupe" sous={detail.titre} onFermer={fermerDetail}>
          <div className="groupe-section">
            <span className="label">Paramètres de confidentialité</span>
            <ul className="groupe-regles">
              {[...niveaux.find((n) => n.id === detail.classification).regles, "Seuls les agents enrôlés peuvent être invités", "Un agent révoqué est retiré automatiquement"].map((r) => (
                <li key={r}>
                  <Check size={15} />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="groupe-section">
            <div className="groupe-section-haut">
              <span className="label">{detail.membres.length} participants</span>
              {responsable && (
                <button type="button" className="btn-outline" onClick={() => setAjout(!ajout)}>
                  <UserPlus size={15} />
                  Ajouter
                </button>
              )}
            </div>
            {!responsable && <p className="espace-note">Seuls les responsables du groupe peuvent modifier les participants.</p>}

            {ajout && (
              <div className="groupe-ajout">
                <SelecteurAgents agents={agents} ministeres={ministeres} selection={selection} exclus={detail.membres.map((m) => m.agentId)} onChange={setSelection} />
                <div className="portail-actions">
                  <button type="button" className="btn-outline" onClick={() => setAjout(false)}>
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!selection.length}
                    onClick={() => {
                      const ids = selection;
                      setSelection([]);
                      setAjout(false);
                      agir(() => modifierMembres(detail.id, ids, []), `${ids.length} participant(s) ajouté(s). Les nouvelles clés de groupe ont été distribuées.`);
                    }}
                  >
                    Ajouter {selection.length || ""}
                  </button>
                </div>
              </div>
            )}

            {detail.membres.map((m) => {
              const a = agent(m.agentId);
              if (!a) return null;
              return (
                <div key={a.id} className="infos-membre">
                  <AvatarAgent nom={a.nomComplet} taille={36} presence={a.presence} />
                  <span className="portail-ligne-texte">
                    <strong>
                      {a.nomComplet} {a.id === user.id && <em>(vous)</em>}
                    </strong>
                    <span>
                      {a.fonction} · {sigle(a.ministereId)}
                    </span>
                  </span>
                  {responsable && a.id !== user.id ? (
                    <>
                      <button type="button" className={m.role === "responsable" ? "groupe-role actif" : "groupe-role"} onClick={() => agir(() => basculerResponsable(detail.id, a.id), "Rôle mis à jour.")}>
                        <Crown size={14} />
                        {m.role === "responsable" ? "Responsable" : "Membre"}
                      </button>
                      <button type="button" className="portail-action" aria-label={`Retirer ${a.prenom}`} onClick={() => setRetrait(a.id)}>
                        <UserMinus size={16} />
                      </button>
                    </>
                  ) : (
                    m.role === "responsable" && (
                      <span className="groupe-role actif">
                        <Crown size={14} />
                        Responsable
                      </span>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </Fenetre>
      )}

      {aRetirer && (
        <Fenetre
          danger
          titre="Retirer ce participant ?"
          sous={`${aRetirer.nomComplet} ne pourra plus lire les nouveaux messages de ce groupe.`}
          onFermer={() => setRetrait(null)}
          pied={
            <>
              <button type="button" className="btn-outline" onClick={() => setRetrait(null)}>
                Annuler
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  const id = retrait;
                  setRetrait(null);
                  agir(() => modifierMembres(detail.id, [], [id]), "Participant retiré. Il ne peut plus lire les nouveaux messages du groupe.");
                }}
              >
                <UserMinus size={15} />
                Retirer
              </button>
            </>
          }
        >
          <p>Les clés du groupe seront renouvelées automatiquement après son retrait.</p>
        </Fenetre>
      )}
    </div>
  );
}
