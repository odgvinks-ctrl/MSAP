import { initiales, teinteDe } from "../utils/texte.js";
import "./AvatarAgent.css";

export default function AvatarAgent({ nom, taille = 40, revoque = false, presence }) {
  const teinte = teinteDe(nom);
  return (
    <span className="avatar-cadre" style={{ width: taille, height: taille }}>
      <span
        className={revoque ? "avatar-agent revoque" : "avatar-agent"}
        style={{
          width: taille,
          height: taille,
          fontSize: taille * 0.36,
          background: `hsl(${teinte} 45% 38%)`,
        }}
        aria-hidden="true"
      >
        {initiales(nom)}
      </span>
      {presence && !revoque && <span className={`avatar-presence ${presence}`} style={{ width: Math.max(9, taille * 0.27), height: Math.max(9, taille * 0.27) }} />}
    </span>
  );
}
