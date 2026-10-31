import { requete } from "./http.js";
import { revocationDepuisApi } from "./adaptateurs.js";

export const etapesRevocation = [
  { cle: "identite", libelle: "Désactivation du compte dans le système d'identité", systeme: "Keycloak" },
  { cle: "sessions", libelle: "Révocation des sessions et des jetons d'accès", systeme: "Keycloak · Synapse" },
  { cle: "appareils", libelle: "Déconnexion de tous les appareils", systeme: "Synapse" },
  { cle: "salons", libelle: "Retrait des salons et renouvellement des clés de groupe", systeme: "Synapse" },
  { cle: "blocage", libelle: "Blocage des connexions futures", systeme: "Synapse" },
];

export async function revoquerAgent(id, motif) {
  if (!motif.trim()) throw new Error("Indiquez le motif de la révocation.");
  const reponse = await requete(`/admin/agents/${encodeURIComponent(id)}/revocation`, {
    methode: "POST",
    corps: { motif: motif.trim() },
  });
  return revocationDepuisApi(reponse);
}

export async function getRevocations() {
  const liste = await requete("/admin/revocations");
  return liste.map(revocationDepuisApi);
}
