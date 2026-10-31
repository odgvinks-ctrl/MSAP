export function interlocuteur(conversation, moi, agents) {
  const autre = conversation.membres.find((m) => m.agentId !== moi);
  return autre ? agents.find((a) => a.id === autre.agentId) : null;
}

export function titreConversation(conversation, moi, agents) {
  if (conversation.type === "groupe") return conversation.titre;
  const autre = interlocuteur(conversation, moi, agents);
  return autre ? autre.nomComplet : "Agent sans accès";
}

export function apercuMessage(message) {
  if (!message) return "Nouvelle conversation";
  if (message.systeme) return message.texte;
  if (message.expire) return "Message expiré";
  if (message.classification === "confidentiel") return "Message confidentiel";
  if (message.vocal) return "Message vocal";
  if (message.piece && !message.texte) return message.piece.nom;
  return message.texte;
}

export const categories = {
  ministeriel: "Ministériel",
  direction: "Direction",
  interministeriel: "Interministériel",
  projet: "Projet",
  travail: "Groupe de travail",
};
