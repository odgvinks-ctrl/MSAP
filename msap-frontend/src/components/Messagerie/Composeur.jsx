import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mic, Paperclip, SendHorizontal, Settings2, Square, Trash2, X } from "lucide-react";
import IconeFichier from "./IconeFichier.jsx";
import PanneauClassification from "./PanneauClassification.jsx";
import { niveaux } from "../../data/niveaux.js";
import { documentsDemo, nomType } from "../../data/fichiers.js";
import { useLangue } from "../../context/LangueContext.jsx";
import { duree } from "../../utils/texte.js";
import { apercuMessage } from "../../utils/conversations.js";

function reglesDefaut(destinataires) {
  return {
    destinataires,
    transfertInterdit: true,
    copieInterdite: true,
    lectureUnique: false,
    accuseObligatoire: true,
    dureeMinutes: 60,
  };
}

export default function Composeur({ conversation, autres, reponse, reponseAuteur, onAnnulerReponse, onEnvoyer }) {
  const { t } = useLangue();
  const impose = conversation.classification === "confidentiel";
  const [texte, setTexte] = useState("");
  const [classification, setClassification] = useState(impose ? "confidentiel" : "standard");
  const [restrictions, setRestrictions] = useState(null);
  const [menuNiveau, setMenuNiveau] = useState(false);
  const [menuPiece, setMenuPiece] = useState(false);
  const [panneau, setPanneau] = useState(false);
  const [piece, setPiece] = useState(null);
  const [enregistrement, setEnregistrement] = useState(null);
  const zone = useRef(null);
  const enCours = enregistrement !== null;

  useEffect(() => {
    if (!enCours) return;
    const minuteur = setInterval(() => setEnregistrement((s) => (s === null ? null : s + 1)), 1000);
    return () => clearInterval(minuteur);
  }, [enCours]);

  useEffect(() => {
    if (reponse) zone.current?.focus();
  }, [reponse]);

  useEffect(() => {
    const z = zone.current;
    if (!z) return;
    z.style.height = "auto";
    z.style.height = `${Math.min(z.scrollHeight, 160)}px`;
  }, [texte]);

  function choisirNiveau(id) {
    setMenuNiveau(false);
    setClassification(id);
    if (id === "confidentiel") {
      setPanneau(true);
    } else {
      setRestrictions(null);
    }
  }

  function reglesEnvoi() {
    if (classification === "confidentiel") return restrictions;
    if (classification === "restreint") return { ...reglesDefaut(autres.map((a) => a.id)), copieInterdite: false, accuseObligatoire: false, dureeMinutes: 43200 };
    return null;
  }

  function envoyer() {
    if (!texte.trim() && !piece) return;
    if (classification === "confidentiel" && !restrictions) {
      setPanneau(true);
      return;
    }
    onEnvoyer({ texte: texte.trim(), classification, restrictions: reglesEnvoi(), piece });
    setTexte("");
    setPiece(null);
    if (!impose) {
      setClassification("standard");
      setRestrictions(null);
    }
  }

  function terminerVocal() {
    if (enregistrement > 0) {
      onEnvoyer({
        texte: "",
        classification,
        restrictions: classification === "confidentiel" ? restrictions || reglesDefaut(autres.map((a) => a.id)) : reglesEnvoi(),
        vocal: { duree: enregistrement },
      });
    }
    setEnregistrement(null);
  }

  const niveau = niveaux.find((n) => n.id === classification);
  const IconeNiveau = niveau.icone;
  const pret = texte.trim() || piece;

  return (
    <div className="composeur">
      {(reponse || piece || (classification !== "standard" && !enCours)) && (
        <div className="composeur-haut">
          {reponse && (
            <div className="composeur-reponse">
              <div>
                <strong>Réponse à {reponseAuteur ? reponseAuteur.prenom : "l'agent"}</strong>
                <span>{apercuMessage(reponse)}</span>
              </div>
              <button type="button" aria-label="Annuler la réponse" onClick={onAnnulerReponse}>
                <X size={16} />
              </button>
            </div>
          )}
          {piece && (
            <div className="composeur-piece">
              <IconeFichier type={piece.type} taille={34} />
              <div>
                <strong>{piece.nom}</strong>
                <span>
                  {nomType(piece.type)} · {piece.taille} · sera chiffré avant l'envoi
                </span>
              </div>
              <button type="button" aria-label="Retirer la pièce jointe" onClick={() => setPiece(null)}>
                <X size={16} />
              </button>
            </div>
          )}
          {classification !== "standard" && (
            <div className={`composeur-niveau ${classification}`}>
              <IconeNiveau size={14} />
              <span>
                <strong>{niveau.nom}</strong>
                {classification === "confidentiel"
                  ? restrictions
                    ? ` · ${restrictions.destinataires.length} destinataire(s) · expire dans ${duree(restrictions.dureeMinutes)}`
                    : " · règles à définir"
                  : " · transfert interdit · expire dans 30 jours"}
              </span>
              {classification === "confidentiel" && (
                <button type="button" onClick={() => setPanneau(true)}>
                  <Settings2 size={14} />
                  Régler
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="composeur-ligne">
        {enCours ? (
          <div className="composeur-enregistrement">
            <span className="composeur-point" />
            <strong>0:{String(enregistrement).padStart(2, "0")}</strong>
            <span>Enregistrement simulé · le son sera chiffré avant l'envoi</span>
            <button type="button" aria-label="Annuler" onClick={() => setEnregistrement(null)}>
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="composeur-ancre">
              <button type="button" className="composeur-bouton" aria-label="Joindre un fichier" onClick={() => setMenuPiece(!menuPiece)}>
                <Paperclip size={20} />
              </button>
              {menuPiece && (
                <>
                  <div className="composeur-voile" onClick={() => setMenuPiece(false)} />
                  <div className="composeur-menu">
                    <p className="label">Documents de démonstration</p>
                    {documentsDemo.map((d) => (
                      <button
                        key={d.nom}
                        type="button"
                        className="composeur-option"
                        onClick={() => {
                          setPiece(d);
                          setMenuPiece(false);
                        }}
                      >
                        <IconeFichier type={d.type} taille={32} />
                        <span>
                          <strong>{d.nom}</strong>
                          <small>{d.taille}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="composeur-zone">
              <div className="composeur-ancre">
                <button type="button" className={`composeur-choix ${classification}`} title="Niveau de classification" onClick={() => setMenuNiveau(!menuNiveau)}>
                  <IconeNiveau size={16} strokeWidth={2.2} />
                  <span>{niveau.court}</span>
                  <ChevronDown size={12} />
                </button>
                {menuNiveau && (
                  <>
                    <div className="composeur-voile" onClick={() => setMenuNiveau(false)} />
                    <div className="composeur-menu">
                      <p className="label">Niveau de classification</p>
                      {niveaux.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          disabled={impose && n.id !== "confidentiel"}
                          className={classification === n.id ? "composeur-option actif" : "composeur-option"}
                          onClick={() => choisirNiveau(n.id)}
                        >
                          <span className={`badge-niveau ${n.id}`}>{n.court}</span>
                          <span>
                            <strong>{n.nom}</strong>
                            <small>{n.desc}</small>
                          </span>
                        </button>
                      ))}
                      {impose && <p className="composeur-note">Ce salon impose le niveau Confidentiel.</p>}
                    </div>
                  </>
                )}
              </div>
              <textarea
                ref={zone}
                rows={1}
                value={texte}
                placeholder={t("chat.ecrire")}
                onChange={(e) => setTexte(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    envoyer();
                  }
                }}
              />
            </div>
          </>
        )}

        {enCours ? (
          <button type="button" className="composeur-envoi" aria-label="Envoyer le message vocal" onClick={terminerVocal}>
            <Square size={16} fill="currentColor" />
          </button>
        ) : pret ? (
          <button type="button" className={classification === "confidentiel" ? "composeur-envoi confidentiel" : "composeur-envoi"} aria-label="Envoyer" onClick={envoyer}>
            <SendHorizontal size={20} />
          </button>
        ) : (
          <button type="button" className="composeur-bouton" aria-label="Enregistrer un message vocal" onClick={() => setEnregistrement(0)}>
            <Mic size={20} />
          </button>
        )}
      </div>

      {panneau && (
        <PanneauClassification
          membres={autres}
          initial={restrictions || reglesDefaut(autres.map((a) => a.id))}
          onFermer={() => {
            setPanneau(false);
            if (!restrictions && !impose) setClassification("standard");
          }}
          onValider={(r) => {
            setRestrictions(r);
            setClassification("confidentiel");
            setPanneau(false);
            zone.current?.focus();
          }}
        />
      )}
    </div>
  );
}
