import "./AvatarAgent.css";

const fonds = { standard: "#12264A", restreint: "#5A3E0E", confidentiel: "#3A1416" };

export default function AvatarGroupe({ titre, classification = "standard", taille = 40 }) {
  const mots = titre.replace(/[^\p{L}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const lettres = ((mots[0]?.[0] || "") + (mots[1]?.[0] || "")).toUpperCase();
  return (
    <span className="avatar-cadre" style={{ width: taille, height: taille }}>
      <span
        className="avatar-agent"
        style={{ width: taille, height: taille, fontSize: taille * 0.34, borderRadius: taille * 0.28, background: fonds[classification] }}
        aria-hidden="true"
      >
        {lettres}
      </span>
      <span className="avatar-presence groupe" style={{ width: 10, height: 10, background: "var(--or)" }} />
    </span>
  );
}
