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

export function contactDepuisApi(a) {
  return {
    id: String(a.id),
    prenom: a.prenom,
    nom: a.nom,
    nomComplet: `${a.prenom} ${a.nom}`,
    email: a.email,
    telephone: a.telephone || "",
    fonction: a.fonction,
    ministereId: a.ministere_id,
    directionId: a.direction_id,
    statut: a.statut,
    presence: a.presence || "hors_ligne",
  };
}

export function messageDepuisApi(m) {
  return {
    id: String(m.id),
    conversationId: m.conversation_id,
    auteurId: m.auteur_id,
    texte: m.texte || "",
    date: m.envoye_le,
    classification: m.classification || "standard",
    expireLe: m.expire_le,
    expire: Boolean(m.expire),
    autorise: m.autorise !== false,
    restrictions: m.restrictions
      ? {
          destinataires: m.restrictions.destinataires || [],
          transfertInterdit: m.restrictions.transfert_interdit,
          copieInterdite: m.restrictions.copie_interdite,
          lectureUnique: m.restrictions.lecture_unique,
          accuseObligatoire: m.restrictions.accuse_obligatoire,
          dureeMinutes: m.restrictions.duree_minutes,
        }
      : null,
    repondA: m.repond_a,
    reactions: m.reactions || [],
    piece: m.piece,
    vocal: m.vocal,
    lu: m.lu,
    systeme: m.systeme,
    accuses: m.accuses || [],
  };
}

export function conversationDepuisApi(c) {
  return {
    id: c.id,
    type: c.type,
    titre: c.titre || "",
    description: c.description || "",
    categorie: c.categorie,
    classification: c.classification,
    membres: c.membres.map((m) => ({ agentId: m.agent_id, role: m.role })),
    nonLus: c.non_lus || 0,
    epingle: Boolean(c.epingle),
    creeLe: c.cree_le,
    dernier: c.dernier ? messageDepuisApi(c.dernier) : null,
  };
}

export function restrictionsVersApi(r) {
  if (!r) return null;
  return {
    destinataires: r.destinataires,
    transfert_interdit: r.transfertInterdit,
    copie_interdite: r.copieInterdite,
    lecture_unique: r.lectureUnique,
    accuse_obligatoire: r.accuseObligatoire,
    duree_minutes: r.dureeMinutes,
  };
}

export function appareilDepuisApi(d) {
  return {
    id: d.id,
    nom: d.nom,
    type: d.type,
    navigateur: d.navigateur,
    lieu: d.lieu,
    ip: d.ip,
    derniereActivite: d.derniere_activite,
    verifie: d.verifie,
    courant: Boolean(d.courant),
  };
}
