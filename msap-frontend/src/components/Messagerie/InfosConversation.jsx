import { useState } from "react";
import { BadgeCheck, Crown, KeyRound, Lock, Mail, MessageSquareText, Phone, ShieldCheck, X } from "lucide-react";
import AvatarAgent from "../AvatarAgent.jsx";
import AvatarGroupe from "../AvatarGroupe.jsx";
import Fenetre from "../Fenetre.jsx";
import IconeFichier from "./IconeFichier.jsx";
import { niveaux } from "../../data/niveaux.js";
import { categories, interlocuteur, titreConversation } from "../../utils/conversations.js";

function codeSecurite(graine) {
  let h = 2166136261;
  for (const lettre of graine) h = Math.imul(h ^ lettre.charCodeAt(0), 16777619) >>> 0;
  return Array.from({ length: 8 }, (_, i) => String(((h >>> (i * 3)) ^ (i * 7919)) % 100000).padStart(5, "0"));
}

export default function InfosConversation({ conversation, agents, ministeres, messages, moi, onFermer, onEcrire }) {
  const [verification, setVerification] = useState(false);
  const [verifie, setVerifie] = useState(false);
  const groupe = conversation.type === "groupe";
  const autre = groupe ? null : interlocuteur(conversation, moi, agents);
  const titre = titreConversation(conversation, moi, agents);
  const niveau = niveaux.find((n) => n.id === conversation.classification);
  const fichiers = messages.filter((m) => m.piece);
  const ministere = autre && ministeres.find((m) => m.id === autre.ministereId);
  const direction = ministere && ministere.directions.find((d) => d.id === autre.directionId);
  const code = codeSecurite([moi, autre ? autre.id : conversation.id].sort().join(":"));
  const sigle = (a) => ministeres.find((m) => m.id === a.ministereId)?.sigle;

  return (
    <>
      <div className="infos-voile" onClick={onFermer} />
      <aside className="infos">
        <div className="infos-entete">
          <strong>{groupe ? "Informations du groupe" : "Profil"}</strong>
          <button type="button" className="chat-icone" aria-label="Fermer" onClick={onFermer}>
            <X size={20} />
          </button>
        </div>

        <div className="infos-corps">
          <div className="infos-identite">
            {groupe ? <AvatarGroupe titre={titre} classification={conversation.classification} taille={72} /> : <AvatarAgent nom={titre} taille={72} presence={autre?.presence} revoque={!autre} />}
            <h3>{titre}</h3>
            <p>{groupe ? `${categories[conversation.categorie] || "Groupe de travail"} · ${conversation.membres.length} membres` : autre ? autre.fonction : "Accès retiré"}</p>
            {groupe && conversation.description && <p className="infos-description">{conversation.description}</p>}
            {verifie && (
              <span className="badge-statut valide">
                <BadgeCheck size={13} />
                Identité vérifiée
              </span>
            )}
          </div>

          {autre && (
            <section className="infos-section">
              <div>
                <span className="label">Ministère</span>
                <p>{ministere?.nom}</p>
              </div>
              <div>
                <span className="label">Direction</span>
                <p>{direction?.nom || "—"}</p>
              </div>
              <p className="infos-contact">
                <Mail size={15} />
                {autre.email}
              </p>
              {autre.telephone && (
                <p className="infos-contact">
                  <Phone size={15} />
                  {autre.telephone}
                </p>
              )}
            </section>
          )}

          <section className="infos-section">
            <span className="label">Niveau du salon</span>
            <div className="infos-niveau">
              <span className={`badge-niveau ${niveau.id}`}>{niveau.nom}</span>
              <p>{niveau.desc}</p>
              <ul>
                {niveau.regles.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="infos-section">
            <span className="label">Sécurité</span>
            <p className="infos-contact vert">
              <Lock size={15} />
              Chiffrement de bout en bout actif
            </p>
            <p className="infos-contact">
              <ShieldCheck size={15} />
              Clés renouvelées à chaque changement de membres
            </p>
            {autre && (
              <button type="button" className="infos-verifier" onClick={() => setVerification(true)}>
                <KeyRound size={15} />
                Vérifier le code de sécurité
              </button>
            )}
          </section>

          {groupe && (
            <section className="infos-section">
              <span className="label">{conversation.membres.length} membres</span>
              {conversation.membres.map((mb) => {
                const a = agents.find((x) => x.id === mb.agentId);
                if (!a) return null;
                return (
                  <div key={a.id} className="infos-membre">
                    <AvatarAgent nom={a.nomComplet} taille={34} presence={a.presence} />
                    <span className="portail-ligne-texte">
                      <strong>
                        {a.nomComplet} {a.id === moi && <em>(vous)</em>}
                      </strong>
                      <span>
                        {a.fonction} · {sigle(a)}
                      </span>
                    </span>
                    {mb.role === "responsable" && <Crown size={16} className="infos-couronne" aria-label="Responsable" />}
                    {a.id !== moi && a.statut === "actif" && (
                      <button type="button" className="chat-icone petit" aria-label={`Écrire à ${a.prenom}`} onClick={() => onEcrire(a.id)}>
                        <MessageSquareText size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          <section className="infos-section">
            <span className="label">Fichiers ({fichiers.length})</span>
            {fichiers.length === 0 && <p className="portail-discret">Aucun fichier partagé.</p>}
            {fichiers.map((m) => (
              <p key={m.id} className="infos-fichier">
                <IconeFichier type={m.piece.type} taille={30} />
                <span>{m.piece.nom}</span>
              </p>
            ))}
          </section>
        </div>
      </aside>

      {verification && (
        <Fenetre
          titre="Code de sécurité"
          sous={`Comparez ce code avec celui affiché sur l'appareil de ${autre.nomComplet}.`}
          onFermer={() => setVerification(false)}
          pied={
            <>
              <button type="button" className="btn-outline" onClick={() => setVerification(false)}>
                Plus tard
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setVerifie(true);
                  setVerification(false);
                }}
              >
                <BadgeCheck size={15} />
                Les codes correspondent
              </button>
            </>
          }
        >
          <div className="infos-code mono">
            {code.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
          <p className="portail-discret">
            Ce code est dérivé des clés publiques des deux appareils. S'ils sont identiques, personne ne s'est interposé entre vous. Code simulé en mode démonstration.
          </p>
        </Fenetre>
      )}
    </>
  );
}
