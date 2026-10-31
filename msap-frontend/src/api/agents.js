import { requete } from "./http.js";
import { agentDepuisApi, agentVersApi } from "./adaptateurs.js";

export async function getAgents() {
  const liste = await requete("/admin/agents");
  return liste.map(agentDepuisApi);
}

export async function getAgent(id) {
  return agentDepuisApi(await requete(`/admin/agents/${encodeURIComponent(id)}`));
}

export async function enrolerAgent(form) {
  const reponse = await requete("/admin/agents", { methode: "POST", corps: agentVersApi(form) });
  return {
    agent: agentDepuisApi(reponse.agent),
    codeActivation: reponse.code_activation,
    expireDansHeures: reponse.expire_dans_heures,
  };
}

export async function modifierAgent(id, champs) {
  const corps = {
    fonction: champs.fonction.trim(),
    direction_id: champs.directionId,
    role: champs.role,
    telephone: champs.telephone.trim(),
  };
  return agentDepuisApi(await requete(`/admin/agents/${encodeURIComponent(id)}`, { methode: "PATCH", corps }));
}

export async function suspendreAgent(id) {
  return agentDepuisApi(await requete(`/admin/agents/${encodeURIComponent(id)}/suspension`, { methode: "POST", corps: {} }));
}

export async function reactiverAgent(id) {
  return agentDepuisApi(await requete(`/admin/agents/${encodeURIComponent(id)}/reactivation`, { methode: "POST", corps: {} }));
}

export async function renvoyerActivation(id) {
  const reponse = await requete(`/admin/agents/${encodeURIComponent(id)}/activation`, { methode: "POST", corps: {} });
  return { codeActivation: reponse.code_activation, expireDansHeures: reponse.expire_dans_heures };
}
