import { requete } from "./http.js";
import { regleDepuisApi, regleVersApi } from "./adaptateurs.js";

export async function getRegles() {
  const liste = await requete("/admin/classifications");
  return liste.map(regleDepuisApi);
}

export async function enregistrerRegle(regle) {
  const reponse = await requete(`/admin/classifications/${encodeURIComponent(regle.id)}`, {
    methode: "PUT",
    corps: regleVersApi(regle),
  });
  return regleDepuisApi(reponse);
}
