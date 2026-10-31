export function initiales(nom) {
  const lettres = nom
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0].toUpperCase());
  return lettres.join("") || "?";
}

export function depuis(iso) {
  if (!iso) return "jamais";
  const secondes = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secondes < 60) return "à l'instant";
  const minutes = Math.floor(secondes / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  if (jours < 30) return `il y a ${jours} j`;
  return formaterDate(iso);
}

export function heure(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formaterDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function dateHeure(iso) {
  if (!iso) return "";
  return `${new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} à ${heure(iso)}`;
}

export function teinteDe(nom) {
  let somme = 0;
  for (const lettre of nom) somme += lettre.charCodeAt(0);
  return (somme * 7) % 360;
}

export function sansAccent(texte) {
  return texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function contient(texte, recherche) {
  return sansAccent(texte).includes(sansAccent(recherche.trim()));
}

export function duree(minutes) {
  if (!minutes) return "Sans expiration";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} h`;
  const jours = Math.round(minutes / 1440);
  return `${jours} jour${jours > 1 ? "s" : ""}`;
}

function memeJour(a, b) {
  return a.toDateString() === b.toDateString();
}

export function horodatage(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const maintenant = new Date();
  if (memeJour(d, maintenant)) return heure(iso);
  if (memeJour(d, new Date(maintenant.getTime() - 86400000))) return "Hier";
  if (maintenant.getTime() - d.getTime() < 6 * 86400000) return d.toLocaleDateString("fr-FR", { weekday: "long" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function separateurJour(iso) {
  const d = new Date(iso);
  const maintenant = new Date();
  if (memeJour(d, maintenant)) return "Aujourd'hui";
  if (memeJour(d, new Date(maintenant.getTime() - 86400000))) return "Hier";
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export function restant(iso, maintenant) {
  const s = Math.max(0, Math.round((new Date(iso).getTime() - maintenant) / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${String(s % 60).padStart(2, "0")} s`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h ${String(m % 60).padStart(2, "0")}`;
  return `${Math.floor(h / 24)} jours`;
}
