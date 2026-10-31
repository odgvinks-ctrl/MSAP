import { initiales, teinteDe } from "../utils/texte.js";
import "./AvatarAgent.css";

export default function AvatarAgent({ nom, taille = 40, revoque = false }) {
  const teinte = teinteDe(nom);
  return (
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
  );
}
