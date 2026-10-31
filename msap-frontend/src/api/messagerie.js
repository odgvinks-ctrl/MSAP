import { requete } from "./http.js";
import {
  appareilDepuisApi,
  contactDepuisApi,
  conversationDepuisApi,
  messageDepuisApi,
  ministereDepuisApi,
  regleDepuisApi,
  restrictionsVersApi,
} from "./adaptateurs.js";

export async function getConversations() {
  const liste = await requete("/messagerie/conversations");
  return liste.map(conversationDepuisApi);
}

export async function getMessages(conversationId) {
  const liste = await requete(`/messagerie/conversations/${encodeURIComponent(conversationId)}/messages`);
  return liste.map(messageDepuisApi);
}

export async function envoyerMessage(conversationId, envoi) {
  const propre = (envoi.texte || "").trim();
  if (!propre && !envoi.piece && !envoi.vocal) throw new Error("Le message est vide.");
  if (propre.length > 4000) throw new Error("Le message est trop long (4000 caractères maximum).");
  const m = await requete(`/messagerie/conversations/${encodeURIComponent(conversationId)}/messages`, {
    methode: "POST",
    corps: {
      texte: propre,
      classification: envoi.classification,
      restrictions: restrictionsVersApi(envoi.restrictions),
      repond_a: envoi.repondA || null,
      piece: envoi.piece || null,
      vocal: envoi.vocal || null,
    },
  });
  return messageDepuisApi(m);
}

export async function demarrerConversation(agentId) {
  const c = await requete("/messagerie/conversations", { methode: "POST", corps: { type: "direct", agent_id: agentId } });
  return conversationDepuisApi(c);
}

export async function creerGroupe(groupe) {
  const c = await requete("/messagerie/conversations", {
    methode: "POST",
    corps: {
      type: "groupe",
      titre: groupe.titre,
      description: groupe.description,
      categorie: groupe.categorie,
      classification: groupe.classification,
      membres: groupe.membres,
    },
  });
  return conversationDepuisApi(c);
}

export async function modifierMembres(conversationId, ajout, retrait) {
  const c = await requete(`/messagerie/conversations/${encodeURIComponent(conversationId)}/membres`, {
    methode: "POST",
    corps: { ajout, retrait },
  });
  return conversationDepuisApi(c);
}

export async function basculerResponsable(conversationId, agentId) {
  const c = await requete(`/messagerie/conversations/${encodeURIComponent(conversationId)}/responsables`, {
    methode: "POST",
    corps: { agent_id: agentId },
  });
  return conversationDepuisApi(c);
}

export async function reagir(messageId, emoji) {
  return messageDepuisApi(await requete(`/messagerie/messages/${encodeURIComponent(messageId)}/reactions`, { methode: "POST", corps: { emoji } }));
}

export async function accuserLecture(messageId) {
  return messageDepuisApi(await requete(`/messagerie/messages/${encodeURIComponent(messageId)}/accuse`, { methode: "POST", corps: {} }));
}

export async function transfererMessage(messageId, conversationId) {
  return messageDepuisApi(
    await requete(`/messagerie/messages/${encodeURIComponent(messageId)}/transfert`, { methode: "POST", corps: { conversation_id: conversationId } }),
  );
}

export async function getEnregistres() {
  const liste = await requete("/messagerie/enregistres");
  return liste.map(messageDepuisApi);
}

export async function basculerEnregistre(messageId) {
  const r = await requete(`/messagerie/enregistres/${encodeURIComponent(messageId)}`, { methode: "POST", corps: {} });
  return r.enregistres;
}

export async function getAnnuaire() {
  const [agents, ministeres] = await Promise.all([requete("/messagerie/annuaire"), requete("/messagerie/ministeres")]);
  return { agents: agents.map(contactDepuisApi), ministeres: ministeres.map(ministereDepuisApi) };
}

export async function getReglesMessagerie() {
  const liste = await requete("/messagerie/regles");
  return liste.map(regleDepuisApi);
}

export async function getFichiers() {
  const liste = await requete("/messagerie/fichiers");
  return liste.map(messageDepuisApi);
}

export async function getAppareils() {
  const liste = await requete("/messagerie/appareils");
  return liste.map(appareilDepuisApi);
}

export async function deconnecterAppareil(id) {
  await requete(`/messagerie/appareils/${encodeURIComponent(id)}`, { methode: "DELETE" });
}

export async function signalerPerte(appareilId) {
  await requete("/messagerie/urgence", { methode: "POST", corps: { appareil_id: appareilId } });
}

export async function getConnexions() {
  return requete("/messagerie/connexions");
}

export async function changerPresence(presence) {
  return requete("/messagerie/presence", { methode: "PUT", corps: { presence } });
}
