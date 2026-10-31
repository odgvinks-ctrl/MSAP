import { requete } from "./http.js";
import { ministereDepuisApi } from "./adaptateurs.js";

export async function getMinisteres() {
  const liste = await requete("/admin/ministeres");
  return liste.map(ministereDepuisApi);
}
