import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FolderLock, MessageSquareText, Search } from "lucide-react";
import IconeFichier from "../components/Messagerie/IconeFichier.jsx";
import ApercuFichier from "../components/Messagerie/ApercuFichier.jsx";
import { getAnnuaire, getConversations, getFichiers } from "../api/messagerie.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { niveaux } from "../data/niveaux.js";
import { nomType, typesFichier } from "../data/fichiers.js";
import { contient, formaterDate } from "../utils/texte.js";
import { titreConversation } from "../utils/conversations.js";
import "./Portail.css";
import "./Espace.css";
import "../components/Messagerie/Chat.css";

export default function Fichiers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fichiers, setFichiers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [type, setType] = useState("");
  const [classification, setClassification] = useState("");
  const [apercu, setApercu] = useState(null);

  async function charger() {
    try {
      const [f, c, annuaire] = await Promise.all([getFichiers(), getConversations(), getAnnuaire()]);
      setFichiers(f);
      setConversations(c);
      setAgents(annuaire.agents);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "fichiers");

  const liste = fichiers.filter((m) => (!type || m.piece.type === type) && (!classification || m.classification === classification) && (!recherche || contient(m.piece.nom, recherche)));
  const auteur = (id) => agents.find((a) => a.id === id)?.nomComplet || "Agent sans accès";
  const conversation = (id) => {
    const c = conversations.find((x) => x.id === id);
    return c ? titreConversation(c, user.id, agents) : "";
  };
  const court = (id) => niveaux.find((n) => n.id === id).court;

  return (
    <div className="portail espace">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <h1>Fichiers partagés</h1>
            <p className="portail-sous">Documents échangés dans vos conversations. Chaque fichier est chiffré de bout en bout ; les fichiers expirés disparaissent.</p>
          </div>
        </div>

        <div className="portail-filtres fichiers-filtres">
          <label className="portail-recherche">
            <Search size={16} />
            <input value={recherche} placeholder="Rechercher un fichier" onChange={(e) => setRecherche(e.target.value)} />
          </label>
          <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous les types</option>
            {Object.entries(typesFichier).map(([id, nom]) => (
              <option key={id} value={id}>
                {nom}
              </option>
            ))}
          </select>
          <select aria-label="Classification" value={classification} onChange={(e) => setClassification(e.target.value)}>
            <option value="">Toutes classifications</option>
            {niveaux.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nom}
              </option>
            ))}
          </select>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {chargement && <p className="portail-vide">Chargement des fichiers…</p>}
        {!chargement && liste.length === 0 && (
          <div className="portail-carte portail-vide">
            <FolderLock size={28} />
            <p>Aucun document ne correspond à ces critères.</p>
          </div>
        )}

        {liste.length > 0 && (
          <div className="portail-carte portail-tableau repliable">
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Classification</th>
                  <th>Auteur</th>
                  <th>Conversation</th>
                  <th>Partagé le</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {liste.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <button type="button" className="fichier-nom" onClick={() => setApercu(m)}>
                        <IconeFichier type={m.piece.type} taille={36} />
                        <span className="portail-ligne-texte">
                          <strong>{m.piece.nom}</strong>
                          <span>
                            {nomType(m.piece.type)} · {m.piece.taille}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td>
                      <span className={`badge-niveau ${m.classification}`}>{court(m.classification)}</span>
                    </td>
                    <td>{auteur(m.auteurId)}</td>
                    <td>{conversation(m.conversationId)}</td>
                    <td className="portail-discret">{formaterDate(m.date)}</td>
                    <td>
                      <div className="fichier-actions">
                        <button type="button" className="chat-icone petit" aria-label="Aperçu" onClick={() => setApercu(m)}>
                          <Eye size={16} />
                        </button>
                        <button type="button" className="chat-icone petit" aria-label="Ouvrir la conversation" onClick={() => navigate(`/messages/${m.conversationId}`)}>
                          <MessageSquareText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="portail-cartes-mobile fichiers-mobile">
          {liste.map((m) => (
            <button key={m.id} type="button" className="portail-carte fichier-carte" onClick={() => setApercu(m)}>
              <IconeFichier type={m.piece.type} taille={36} />
              <span className="portail-ligne-texte">
                <strong>{m.piece.nom}</strong>
                <span>
                  {auteur(m.auteurId)} · {formaterDate(m.date)}
                </span>
              </span>
              <span className={`badge-niveau ${m.classification}`}>{court(m.classification)}</span>
            </button>
          ))}
        </div>
      </div>

      {apercu && <ApercuFichier message={apercu} auteur={auteur(apercu.auteurId)} nomLecteur={user.nomComplet} onFermer={() => setApercu(null)} />}
    </div>
  );
}
