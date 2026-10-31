import { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";

export default function LecteurVocal({ duree, graine, moi }) {
  const [lecture, setLecture] = useState(false);
  const [position, setPosition] = useState(0);

  const barres = useMemo(() => {
    const base = [...graine].reduce((total, lettre) => (total * 31 + lettre.charCodeAt(0)) >>> 0, 7);
    return Array.from({ length: 32 }, (_, i) => {
      const bruit = ((base >>> (i % 24)) ^ (i * 2654435761)) >>> 0;
      return 22 + (bruit % 70) * (0.55 + 0.45 * Math.sin(i / 3));
    });
  }, [graine]);

  useEffect(() => {
    if (!lecture) return;
    const minuteur = setInterval(() => {
      setPosition((p) => {
        if (p + 0.1 >= duree) {
          setLecture(false);
          return 0;
        }
        return p + 0.1;
      });
    }, 100);
    return () => clearInterval(minuteur);
  }, [lecture, duree]);

  const ratio = position / duree;
  const affiche = Math.ceil(lecture || position ? duree - position : duree);

  return (
    <div className={moi ? "vocal moi" : "vocal"}>
      <button type="button" className="vocal-bouton" aria-label={lecture ? "Pause" : "Écouter"} onClick={() => setLecture(!lecture)}>
        {lecture ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
      </button>
      <span className="vocal-onde">
        {barres.map((b, i) => (
          <span key={i} className={i / barres.length <= ratio ? "joue" : ""} style={{ height: `${Math.min(100, b)}%` }} />
        ))}
      </span>
      <span className="vocal-duree">0:{String(affiche).padStart(2, "0")}</span>
    </div>
  );
}
