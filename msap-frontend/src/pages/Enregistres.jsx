import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkX, MessageSquareText } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import IconeFichier from "../components/Messagerie/IconeFichier.jsx";
import { basculerEnregistre, getAnnuaire, getConversations, getEnregistres } from "../api/messagerie.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { niveaux } from "../data/niveaux.js";
import { dateHeure } from "../utils/texte.js";
import { titreConversation } from "../utils/conversations.js";
import "./Portail.css";
import "./Espace.css";
import "../components/Messagerie/Chat.css";

export default function Enregistres() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  async function charger() {
    try {
      const [m, c, annuaire] = await Promise.all([getEnregistres(), getConversations(), getAnnuaire()]);
      setMessages(m);
      setConversations(c);
      setAgents(annuaire.agents);
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "enregistres");

  async function retirer(id) {
    try {
      await basculerEnregistre(id);
      await charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <div className="portail espace">
      <div className="portail-contenu etroit">
        <div className="portail-entete">
          <div>
            <h1>Messages enregistrés</h1>
            <p className="portail-sous">Retrouvez les instructions et documents importants. Un message classifié reste soumis à son expiration.</p>
          </div>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {chargement && <p className="portail-vide">Chargement…</p>}
        {!chargement && messages.length === 0 && (
          <div className="portail-carte portail-vide">
            <Bookmark size={28} />
            <p>Aucun message enregistré. Survolez un message puis choisissez « Enregistrer ».</p>
          </div>
        )}

        {messages.map((m) => {
          const a = agents.find((x) => x.id === m.auteurId);
          const c = conversations.find((x) => x.id === m.conversationId);
          return (
            <article key={m.id} className="portail-carte enregistre">
              <div className="enregistre-haut">
                <AvatarAgent nom={a ? a.nomComplet : "?"} taille={34} />
                <span className="portail-ligne-texte">
                  <strong>{a ? a.nomComplet : "Agent sans accès"}</strong>
                  <span>
                    {c && titreConversation(c, user.id, agents)} · {dateHeure(m.date)}
                  </span>
                </span>
                <span className={`badge-niveau ${m.classification}`}>{niveaux.find((n) => n.id === m.classification).court}</span>
              </div>
              {m.expire || !m.autorise ? (
                <p className="enregistre-masque">Ce message a expiré et n'est plus accessible.</p>
              ) : (
                <>
                  {m.texte && <p className="enregistre-texte">{m.texte}</p>}
                  {m.piece && (
                    <p className="enregistre-piece">
                      <IconeFichier type={m.piece.type} taille={30} />
                      <span>{m.piece.nom}</span>
                    </p>
                  )}
                </>
              )}
              <div className="enregistre-actions">
                <button type="button" className="enregistre-lien" onClick={() => retirer(m.id)}>
                  <BookmarkX size={16} />
                  Retirer
                </button>
                <button type="button" className="enregistre-lien bleu" onClick={() => navigate(`/messages/${m.conversationId}`)}>
                  <MessageSquareText size={16} />
                  Voir dans la conversation
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
