import { requete } from "./http.js";
import { auditDepuisApi } from "./adaptateurs.js";

export async function getAudit() {
  const liste = await requete("/admin/audit");
  return liste.map(auditDepuisApi);
}

export async function getActivite() {
  return requete("/admin/statistiques/activite");
}
