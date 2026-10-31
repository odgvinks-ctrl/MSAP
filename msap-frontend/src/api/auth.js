import { requete, ecrireJeton, lireJeton } from "./http.js";
import { agentDepuisApi } from "./adaptateurs.js";

export async function chargerMoi() {
  return agentDepuisApi(await requete("/auth/me"));
}

export function sessionActive() {
  return Boolean(lireJeton());
}

export function deconnecter() {
  ecrireJeton(null);
}

export async function login({ email, password }) {
  if (!email.trim() || !password) throw new Error("Renseignez votre adresse et votre mot de passe.");
  const reponse = await requete("/auth/login", {
    methode: "POST",
    corps: { email: email.trim(), password },
    auth: false,
  });
  return reponse.jeton_temporaire;
}

export async function verifierCode(jetonTemporaire, code) {
  if (!/^\d{6}$/.test(code)) throw new Error("Le code contient 6 chiffres.");
  const reponse = await requete("/auth/verification", {
    methode: "POST",
    corps: { jeton_temporaire: jetonTemporaire, code },
    auth: false,
  });
  ecrireJeton(reponse.access_token);
  return chargerMoi();
}
