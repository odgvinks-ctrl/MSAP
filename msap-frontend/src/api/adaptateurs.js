export function agentDepuisApi(a) {
  return {
    id: String(a.id),
    matricule: a.matricule,
    prenom: a.prenom,
    nom: a.nom,
    nomComplet: `${a.prenom} ${a.nom}`,
    email: a.email,
    telephone: a.telephone || "",
    fonction: a.fonction,
    ministereId: a.ministere_id,
    directionId: a.direction_id,
    role: a.role,
    statut: a.statut,
    enroleLe: a.enrole_le,
    derniereConnexion: a.derniere_connexion,
    appareils: a.appareils ?? 0,
    salons: a.salons ?? 0,
  };
}

export function agentVersApi(a) {
  return {
    matricule: a.matricule.trim().toUpperCase(),
    prenom: a.prenom.trim(),
    nom: a.nom.trim(),
    email: a.email.trim().toLowerCase(),
    telephone: a.telephone.trim(),
    fonction: a.fonction.trim(),
    ministere_id: a.ministereId,
    direction_id: a.directionId,
    role: a.role,
  };
}

export function ministereDepuisApi(m) {
  return {
    id: m.id,
    nom: m.nom,
    sigle: m.sigle,
    responsableId: m.responsable_id,
    directions: m.directions || [],
  };
}

export function auditDepuisApi(e) {
  return {
    id: String(e.id),
    date: e.date,
    auteurId: e.auteur_id,
    action: e.action,
    cibleId: e.cible_id,
    resultat: e.resultat,
    details: e.details,
    ip: e.ip,
  };
}

export function revocationDepuisApi(r) {
  return {
    id: String(r.id),
    agentId: String(r.agent_id),
    auteurId: String(r.auteur_id),
    date: r.date,
    motif: r.motif,
    appareils: r.appareils,
    salons: r.salons,
    etapes: r.etapes || [],
  };
}

export function regleDepuisApi(r) {
  return {
    id: r.id,
    dureeMinutes: r.duree_minutes,
    transfertInterdit: r.transfert_interdit,
    copieInterdite: r.copie_interdite,
    accuseLecture: r.accuse_lecture,
    filigrane: r.filigrane,
  };
}

export function regleVersApi(r) {
  return {
    duree_minutes: Number(r.dureeMinutes),
    transfert_interdit: r.transfertInterdit,
    copie_interdite: r.copieInterdite,
    accuse_lecture: r.accuseLecture,
    filigrane: r.filigrane,
  };
}
