import { useState } from "react";
import { Bookmark, BookmarkCheck, Check, CheckCheck, Clock3, Copy, CornerUpLeft, EyeOff, Forward, Lock, ShieldCheck, SmilePlus, TimerOff } from "lucide-react";
import AvatarAgent from "../AvatarAgent.jsx";
import IconeFichier from "./IconeFichier.jsx";
import LecteurVocal from "./LecteurVocal.jsx";
import { niveaux } from "../../data/niveaux.js";
import { nomType } from "../../data/fichiers.js";
import { heure, restant } from "../../utils/texte.js";
import { apercuMessage } from "../../utils/conversations.js";

const emojis = ["👍", "✅", "🙏", "👀", "❗"];

function Action({ icone: Icone, label, onClick, interdit }) {
  return (
    <button type="button" title={label} aria-label={label} className={interdit ? "bulle-action interdit" : "bulle-action"} onClick={interdit ? undefined : onClick}>
      <Icone size={16} />
    </button>
  );
}

export default function Bulle(props) {
  const { message: m, auteur, moi, premier, groupe, cite, citeAuteur, enregistre, maintenant, monId, sigle } = props;
  const [actions, setActions] = useState(false);
  const [emojisOuverts, setEmojisOuverts] = useState(false);

  if (m.systeme) {
    return (
      <div className="bulle-systeme">
        <span>
          <ShieldCheck size={14} />
          {m.texte}
        </span>
      </div>
    );
  }

  const niveau = niveaux.find((n) => n.id === m.classification);
  const IconeNiveau = niveau.icone;
  const protege = m.classification !== "standard";
  const confidentiel = m.classification === "confidentiel";
  const expire = m.expire || (m.expireLe && new Date(m.expireLe).getTime() <= maintenant);
  const transfertInterdit = protege || m.restrictions?.transfertInterdit;
  const copieInterdite = m.restrictions?.copieInterdite || confidentiel;
  const doitAccuser = !moi && m.restrictions?.accuseObligatoire && !m.accuses.includes(monId) && !expire && m.autorise;

  const classes = ["bulle", moi ? "moi" : "", m.classification, premier ? "premier" : "", copieInterdite ? "sans-copie" : ""].filter(Boolean).join(" ");

  return (
    <div className={moi ? "bulle-ligne moi" : "bulle-ligne"} style={{ marginTop: premier ? 12 : 2 }}>
      {!moi && groupe && <div className="bulle-avatar">{premier && <AvatarAgent nom={auteur ? auteur.nomComplet : "?"} taille={32} />}</div>}

      <div className="bulle-colonne">
        {!moi && groupe && premier && (
          <div className="bulle-auteur">
            <strong>{auteur ? auteur.nomComplet : "Agent sans accès"}</strong>
            <span>{sigle}</span>
          </div>
        )}

        <div className={classes} onClick={() => setActions(!actions)}>
          {protege && (
            <div className="bulle-niveau">
              <IconeNiveau size={13} />
              {niveau.nom}
              {m.expireLe && !expire && (
                <span className="bulle-compteur">
                  <Clock3 size={12} />
                  {restant(m.expireLe, maintenant)}
                </span>
              )}
            </div>
          )}

          {expire ? (
            <p className="bulle-masque">
              <TimerOff size={15} />
              Ce message a expiré et n'est plus accessible.
            </p>
          ) : !m.autorise ? (
            <p className="bulle-masque">
              <EyeOff size={15} />
              Vous ne figurez pas parmi les destinataires autorisés.
            </p>
          ) : (
            <div className="bulle-corps">
              {cite && (
                <div className="bulle-cite">
                  <strong>{citeAuteur ? citeAuteur.prenom : "Agent"}</strong>
                  <span>{apercuMessage(cite)}</span>
                </div>
              )}

              {m.piece && (
                <button
                  type="button"
                  className="bulle-piece"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onApercu();
                  }}
                >
                  <IconeFichier type={m.piece.type} />
                  <span className="bulle-piece-texte">
                    <strong>{m.piece.nom}</strong>
                    <span>
                      {nomType(m.piece.type)} · {m.piece.taille}
                      {m.piece.pages ? ` · ${m.piece.pages} p.` : ""}
                    </span>
                  </span>
                  <Lock size={14} />
                </button>
              )}

              {m.vocal && <LecteurVocal duree={m.vocal.duree} graine={m.id} moi={moi} />}

              {m.texte && <p className="bulle-texte">{m.texte}</p>}

              {confidentiel && m.restrictions && (
                <p className="bulle-regles">
                  {[
                    m.restrictions.transfertInterdit && "Transfert interdit",
                    m.restrictions.copieInterdite && "Copie interdite",
                    m.restrictions.lectureUnique && "Lecture unique",
                    m.restrictions.destinataires.length > 0 && `${m.restrictions.destinataires.length} destinataire(s) autorisé(s)`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              {doitAccuser && (
                <button
                  type="button"
                  className="bulle-accuser"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onAccuser();
                  }}
                >
                  <ShieldCheck size={14} />
                  Accuser lecture
                </button>
              )}
            </div>
          )}

          <div className="bulle-heure">
            {heure(m.date)}
            {moi && (m.lu ? <CheckCheck size={14} className="bulle-lu" /> : <Check size={14} />)}
          </div>
        </div>

        {moi && m.restrictions?.accuseObligatoire && !expire && (
          <p className="bulle-accuses">
            <ShieldCheck size={12} />
            Accusés de lecture : {m.accuses.length}/{m.restrictions.destinataires.length || "—"}
          </p>
        )}
        {!moi && m.restrictions?.accuseObligatoire && m.accuses.includes(monId) && !expire && (
          <p className="bulle-accuses ok">
            <ShieldCheck size={12} />
            Lecture accusée
          </p>
        )}

        {m.reactions.length > 0 && (
          <div className="bulle-reactions">
            {m.reactions.map((r) => (
              <button key={r.emoji} type="button" className={r.auteurs.includes(monId) ? "mienne" : ""} onClick={() => props.onReagir(r.emoji)}>
                {r.emoji}
                <span>{r.auteurs.length}</span>
              </button>
            ))}
          </div>
        )}

        {!expire && m.autorise && (
          <div className={actions || emojisOuverts ? "bulle-actions ouvert" : "bulle-actions"}>
            {emojisOuverts ? (
              emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="bulle-emoji"
                  onClick={() => {
                    props.onReagir(e);
                    setEmojisOuverts(false);
                    setActions(false);
                  }}
                >
                  {e}
                </button>
              ))
            ) : (
              <>
                <Action icone={SmilePlus} label="Réagir" onClick={() => setEmojisOuverts(true)} />
                <Action icone={CornerUpLeft} label="Répondre" onClick={props.onRepondre} />
                <Action icone={enregistre ? BookmarkCheck : Bookmark} label={enregistre ? "Retirer des enregistrés" : "Enregistrer"} onClick={props.onEnregistrer} />
                <Action icone={Copy} label={copieInterdite ? "Copie interdite par la classification" : "Copier"} onClick={props.onCopier} interdit={copieInterdite} />
                <Action icone={Forward} label={transfertInterdit ? "Transfert interdit par la classification" : "Transférer"} onClick={props.onTransferer} interdit={transfertInterdit} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
