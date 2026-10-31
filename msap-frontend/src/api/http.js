import { appelDemo } from "./base.js";

const racine = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const CLE_JETON = "msap-jeton";

export const modeDemo = !racine;

export function lireJeton() {
  try {
    return localStorage.getItem(CLE_JETON);
  } catch {
    return null;
  }
}

export function ecrireJeton(jeton) {
  try {
    if (jeton) {
      localStorage.setItem(CLE_JETON, jeton);
    } else {
      localStorage.removeItem(CLE_JETON);
    }
  } catch {
    return;
  }
}

function messageErreur(statut, corps) {
  const detail = corps && (corps.detail || corps.message);
  if (typeof detail === "string") return detail;
  if (statut === 401) return "Votre session a expiré. Reconnectez-vous.";
  if (statut === 403) return "Vous n'avez pas les droits pour cette action.";
  if (statut === 404) return "Élément introuvable.";
  if (statut >= 500) return "Le serveur a rencontré une erreur. Réessayez dans un instant.";
  return "Une erreur est survenue.";
}

function sessionExpiree(statut, auth, jeton) {
  if (statut === 401 && auth && jeton) {
    ecrireJeton(null);
    window.dispatchEvent(new Event("msap-session-expiree"));
  }
}

export async function requete(chemin, { methode = "GET", corps, auth = true } = {}) {
  const jeton = lireJeton();

  if (modeDemo) {
    try {
      return await appelDemo(chemin, { methode, corps, jeton: auth ? jeton : null });
    } catch (err) {
      sessionExpiree(err.statut, auth, jeton);
      throw err;
    }
  }

  const entetes = {};
  if (corps !== undefined) entetes["Content-Type"] = "application/json";
  if (auth && jeton) entetes.Authorization = `Bearer ${jeton}`;

  let reponse;
  try {
    reponse = await fetch(racine + chemin, {
      method: methode,
      headers: entetes,
      body: corps !== undefined ? JSON.stringify(corps) : undefined,
    });
  } catch {
    throw new Error("Impossible de joindre le serveur. Vérifiez votre connexion.");
  }

  if (reponse.status === 204) return null;

  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    sessionExpiree(reponse.status, auth, jeton);
    throw new Error(messageErreur(reponse.status, donnees));
  }
  return donnees;
}
