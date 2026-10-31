import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowLeft, Info, Lock, Search, ShieldCheck, X } from "lucide-react";
import AvatarAgent from "../AvatarAgent.jsx";
import AvatarGroupe from "../AvatarGroupe.jsx";
import Fenetre from "../Fenetre.jsx";
import Bulle from "./Bulle.jsx";
import Composeur from "./Composeur.jsx";
import InfosConversation from "./InfosConversation.jsx";
import ApercuFichier from "./ApercuFichier.jsx";
import { accuserLecture, basculerEnregistre, envoyerMessage, getEnregistres, getMessages, reagir, transfererMessage } from "../../api/messagerie.js";
import { useActualisation } from "../../hooks/useActualisation.js";
import { useLangue } from "../../context/LangueContext.jsx";
import { contient, separateurJour } from "../../utils/texte.js";
import { interlocuteur, titreConversation } from "../../utils/conversations.js";

export default function Fil({ conversation, conversations, agents, ministeres, moi, onRetour, onOuvrir, onEcrire }) {
  const { t } = useLangue();
  const [messages, setMessages] = useState([]);
  const [enregistres, setEnregistres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [infos, setInfos] = useState(false);
  const [recherche, setRecherche] = useState(null);
  const [reponse, setReponse] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [transfert, setTransfert] = useState(null);
  const [avis, setAvis] = useState("");
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const fond = useRef(null);

  async function charger() {
    try {
      const [m, e] = await Promise.all([getMessages(conversation.id), getEnregistres()]);
      setMessages(m);
      setEnregistres(e.map((x) => x.id));
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, conversation.id, 3000);

  useEffect(() => {
    const minuteur = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(minuteur);
  }, []);

  useEffect(() => {
    if (!avis) return;
    const minuteur = setTimeout(() => setAvis(""), 2500);
    return () => clearTimeout(minuteur);
  }, [avis]);

  const total = messages.length;
  useEffect(() => {
    if (recherche === null && fond.current) fond.current.scrollTo({ top: fond.current.scrollHeight, behavior: "smooth" });
  }, [total, recherche]);

  async function agir(action) {
    try {
      await action();
      await charger();
    } catch (err) {
      setAvis(err.message);
    }
  }

  const groupe = conversation.type === "groupe";
  const autre = groupe ? null : interlocuteur(conversation, moi, agents);
  const titre = titreConversation(conversation, moi, agents);
  const membres = conversation.membres.map((m) => agents.find((a) => a.id === m.agentId)).filter(Boolean);
  const autres = membres.filter((a) => a.id !== moi && a.statut === "actif");
  const sigle = (id) => ministeres.find((m) => m.id === id)?.sigle;
  const affiches = recherche ? messages.filter((m) => !m.systeme && m.classification !== "confidentiel" && contient(`${m.texte} ${m.piece?.nom || ""}`, recherche)) : messages;
  const auteurDe = (id) => agents.find((a) => a.id === id);

  return (
    <div className="fil">
      <div className="fil-principal">
        <header className="fil-entete">
          <button type="button" className="chat-icone fil-retour" aria-label="Retour" onClick={onRetour}>
            <ArrowLeft size={20} />
          </button>
          <button type="button" className="fil-qui" onClick={() => setInfos(true)}>
            {groupe ? (
              <AvatarGroupe titre={titre} classification={conversation.classification} taille={40} />
            ) : (
              <AvatarAgent nom={titre} taille={40} presence={autre?.presence} revoque={!autre} />
            )}
            <span className="fil-qui-texte">
              <span>
                <strong>{titre}</strong>
                {conversation.classification !== "standard" && <span className={`badge-niveau ${conversation.classification}`}>{conversation.classification === "confidentiel" ? "Confidentiel" : "Restreint"}</span>}
              </span>
              <small>
                {groupe ? membres.map((a) => a.prenom).join(", ") : autre ? `${t(`presence.${autre.presence}`)} · ${autre.fonction}, ${sigle(autre.ministereId)}` : "Accès retiré par l'administration"}
              </small>
            </span>
          </button>
          <span className="fil-e2e">
            <Lock size={12} />
            {t("chat.e2e")}
          </span>
          <button type="button" className={recherche !== null ? "chat-icone actif" : "chat-icone"} aria-label="Rechercher dans la conversation" onClick={() => setRecherche(recherche === null ? "" : null)}>
            <Search size={19} />
          </button>
          <button type="button" className={infos ? "chat-icone actif" : "chat-icone"} aria-label="Informations" onClick={() => setInfos(!infos)}>
            <Info size={19} />
          </button>
        </header>

        {recherche !== null && (
          <div className="fil-recherche">
            <Search size={16} />
            <input autoFocus value={recherche} placeholder="Rechercher dans cette conversation" onChange={(e) => setRecherche(e.target.value)} />
            {recherche && <span>{affiches.length} résultat(s)</span>}
            <button type="button" aria-label="Fermer la recherche" onClick={() => setRecherche(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="fil-messages" ref={fond}>
          <div className="fil-avertissement">
            <ShieldCheck size={16} />
            <p>Les messages et fichiers de cette conversation sont chiffrés de bout en bout. Le serveur de l'État les relaie sans pouvoir les lire.</p>
          </div>

          {chargement && <p className="portail-vide">Déchiffrement des messages…</p>}
          {erreur && <p className="portail-erreur fil-erreur">{erreur}</p>}

          {affiches.map((m, i) => {
            const prec = affiches[i - 1];
            const nouveauJour = !prec || new Date(prec.date).toDateString() !== new Date(m.date).toDateString();
            const premier = nouveauJour || prec.auteurId !== m.auteurId || prec.systeme || new Date(m.date) - new Date(prec.date) > 360000;
            const cite = m.repondA ? messages.find((x) => x.id === m.repondA) : null;
            const auteur = auteurDe(m.auteurId);
            return (
              <Fragment key={m.id}>
                {nouveauJour && (
                  <div className="fil-jour">
                    <span>{separateurJour(m.date)}</span>
                  </div>
                )}
                <Bulle
                  message={m}
                  auteur={auteur}
                  sigle={auteur ? sigle(auteur.ministereId) : ""}
                  moi={m.auteurId === moi}
                  monId={moi}
                  premier={premier}
                  groupe={groupe}
                  cite={cite}
                  citeAuteur={cite ? auteurDe(cite.auteurId) : null}
                  enregistre={enregistres.includes(m.id)}
                  maintenant={maintenant}
                  onRepondre={() => setReponse(m)}
                  onReagir={(emoji) => agir(() => reagir(m.id, emoji))}
                  onEnregistrer={() => agir(() => basculerEnregistre(m.id))}
                  onTransferer={() => setTransfert(m)}
                  onApercu={() => setApercu(m)}
                  onAccuser={() => agir(() => accuserLecture(m.id))}
                  onCopier={() => {
                    navigator.clipboard?.writeText(m.texte).catch(() => {});
                    setAvis("Texte copié");
                  }}
                />
              </Fragment>
            );
          })}

          {recherche && affiches.length === 0 && <p className="portail-vide">Aucun message ne correspond. Les messages confidentiels sont exclus de la recherche.</p>}
        </div>

        {!groupe && (!autre || autre.statut !== "actif") ? (
          <div className="fil-bloque">
            <ShieldCheck size={16} />
            Les accès de cet agent ont été retirés par l'administration. Aucun nouveau message ne peut lui être remis.
          </div>
        ) : (
          <Composeur
            key={conversation.id}
            conversation={conversation}
            autres={autres}
            reponse={reponse}
            reponseAuteur={reponse ? auteurDe(reponse.auteurId) : null}
            onAnnulerReponse={() => setReponse(null)}
            onEnvoyer={(envoi) => {
              const cible = reponse;
              setReponse(null);
              agir(() => envoyerMessage(conversation.id, { ...envoi, repondA: cible ? cible.id : null }));
            }}
          />
        )}
      </div>

      {infos && <InfosConversation conversation={conversation} agents={agents} ministeres={ministeres} messages={messages} moi={moi} onFermer={() => setInfos(false)} onEcrire={onEcrire} />}

      {apercu && (
        <ApercuFichier
          message={apercu}
          auteur={auteurDe(apercu.auteurId)?.nomComplet}
          nomLecteur={auteurDe(moi)?.nomComplet || "Agent"}
          onFermer={() => setApercu(null)}
        />
      )}

      {transfert && (
        <Fenetre titre="Transférer le message" sous="Choisissez la conversation de destination." onFermer={() => setTransfert(null)}>
          <div className="portail-liste">
            {conversations
              .filter((c) => c.id !== conversation.id)
              .map((c) => {
                const nom = titreConversation(c, moi, agents);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="fil-destination"
                    onClick={() => {
                      const m = transfert;
                      setTransfert(null);
                      agir(async () => {
                        await transfererMessage(m.id, c.id);
                        setAvis(`Message transféré à ${nom}`);
                        onOuvrir(c.id);
                      });
                    }}
                  >
                    {c.type === "groupe" ? <AvatarGroupe titre={nom} classification={c.classification} taille={34} /> : <AvatarAgent nom={nom} taille={34} />}
                    <strong>{nom}</strong>
                  </button>
                );
              })}
          </div>
        </Fenetre>
      )}

      {avis && <div className="chat-avis">{avis}</div>}
    </div>
  );
}
