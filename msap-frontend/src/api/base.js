const CLE = "msap-base-v1";
const CODE_DEMO = "123456";
const IP_ADMIN = "10.12.2.11";

export const delai = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function ilYA(minutes) {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

function joursAvant(jours, heure = 9) {
  const d = new Date(Date.now() - jours * 86400000);
  d.setHours(heure, (jours * 7) % 60, 0, 0);
  return d.toISOString();
}

function graine() {
  const ministeres = [
    { id: "mtd", nom: "Ministère de la Transition digitale", sigle: "MTD", responsable_id: "a02", directions: [
      { id: "mtd-dtd", nom: "Direction de la transformation digitale", sigle: "DTD" },
      { id: "mtd-dssi", nom: "Direction de la sécurité des systèmes d'information", sigle: "DSSI" },
      { id: "mtd-din", nom: "Direction des infrastructures numériques", sigle: "DIN" },
    ] },
    { id: "mef", nom: "Ministère de l'Économie et des Finances", sigle: "MEF", responsable_id: "a09", directions: [
      { id: "mef-dgb", nom: "Direction générale du budget", sigle: "DGB" },
      { id: "mef-dgi", nom: "Direction générale des impôts", sigle: "DGI" },
      { id: "mef-daf", nom: "Direction de l'administration et des finances", sigle: "DAF" },
    ] },
    { id: "ms", nom: "Ministère de la Santé", sigle: "MS", responsable_id: "a14", directions: [
      { id: "ms-dgsp", nom: "Direction générale de la santé publique", sigle: "DGSP" },
      { id: "ms-dpm", nom: "Direction de la pharmacie et du médicament", sigle: "DPM" },
      { id: "ms-dss", nom: "Direction des statistiques sanitaires", sigle: "DSS" },
    ] },
    { id: "men", nom: "Ministère de l'Éducation nationale", sigle: "MEN", responsable_id: "a19", directions: [
      { id: "men-dgeb", nom: "Direction générale de l'éducation de base", sigle: "DGEB" },
      { id: "men-dep", nom: "Direction des études et de la planification", sigle: "DEP" },
    ] },
    { id: "mfp", nom: "Ministère de la Fonction publique", sigle: "MFP", responsable_id: "a23", directions: [
      { id: "mfp-dma", nom: "Direction de la modernisation de l'administration", sigle: "DMA" },
      { id: "mfp-drh", nom: "Direction des ressources humaines", sigle: "DRH" },
    ] },
    { id: "mae", nom: "Ministère des Affaires étrangères", sigle: "MAE", responsable_id: "a27", directions: [
      { id: "mae-dajc", nom: "Direction des affaires juridiques et consulaires", sigle: "DAJC" },
      { id: "mae-dp", nom: "Direction du protocole", sigle: "DP" },
    ] },
    { id: "mat", nom: "Ministère de l'Administration territoriale", sigle: "MAT", responsable_id: "a31", directions: [
      { id: "mat-dec", nom: "Direction de l'état civil", sigle: "DEC" },
      { id: "mat-dct", nom: "Direction des collectivités territoriales", sigle: "DCT" },
    ] },
  ];

  const lignes = [
    ["a01", "Aminata", "Ouédraogo", "Cheffe du service coordination", "mtd-dtd", "agent", "actif", 148, 2],
    ["a02", "Issouf", "Sawadogo", "Responsable sécurité des SI", "mtd-dssi", "super_admin", "actif", 150, 5],
    ["a03", "Clarisse", "Somé", "Ingénieure réseaux", "mtd-din", "agent", "actif", 141, 38],
    ["a04", "Rasmané", "Ilboudo", "Chargé d'études", "mtd-dtd", "responsable_groupe", "actif", 139, 12],
    ["a05", "Pauline", "Yaméogo", "Analyste cybersécurité", "mtd-dssi", "agent", "actif", 122, 240],
    ["a06", "Seydou", "Bationo", "Administrateur systèmes", "mtd-din", "agent", "actif", 97, 21],
    ["a07", "Estelle", "Zoungrana", "Juriste du numérique", "mtd-dtd", "agent", "en_attente", 1, null],
    ["a08", "Boukary", "Zongo", "Directeur de la programmation budgétaire", "mef-dgb", "responsable_groupe", "actif", 133, 9],
    ["a09", "Adjaratou", "Nikiéma", "Administratrice ministérielle", "mef-daf", "admin_ministeriel", "actif", 146, 47],
    ["a10", "Moussa", "Kiendrébéogo", "Inspecteur des impôts", "mef-dgi", "agent", "actif", 88, 1320],
    ["a11", "Rakiéta", "Tapsoba", "Contrôleuse budgétaire", "mef-dgb", "agent", "actif", 76, 64],
    ["a12", "Abdoul", "Bamogo", "Chef du service informatique", "mef-daf", "agent", "suspendu", 64, 4320],
    ["a13", "Mariam", "Compaoré", "Épidémiologiste", "ms-dgsp", "agent", "actif", 127, 16],
    ["a14", "Ousmane", "Ouattara", "Administrateur ministériel", "ms-dss", "admin_ministeriel", "actif", 144, 33],
    ["a15", "Nadège", "Kambou", "Pharmacienne inspectrice", "ms-dpm", "agent", "actif", 101, 610],
    ["a16", "Lassané", "Rouamba", "Statisticien", "ms-dss", "agent", "actif", 58, 120],
    ["a17", "Haoua", "Sana", "Médecin de santé publique", "ms-dgsp", "agent", "en_attente", 2, null],
    ["a18", "Daouda", "Kaboré", "Gestionnaire des stocks", "ms-dpm", "agent", "revoque", 119, 7200],
    ["a19", "Fatimata", "Sankara", "Administratrice ministérielle", "men-dep", "admin_ministeriel", "actif", 137, 74],
    ["a20", "Jean-Baptiste", "Kiemdé", "Inspecteur pédagogique", "men-dgeb", "agent", "actif", 82, 210],
    ["a21", "Alimata", "Derra", "Planificatrice", "men-dep", "agent", "actif", 45, 55],
    ["a22", "Arouna", "Guiro", "Chargé des examens", "men-dgeb", "agent", "actif", 31, 2880],
    ["a23", "Salif", "Traoré", "Directeur de la modernisation", "mfp-dma", "admin_ministeriel", "actif", 131, 7],
    ["a24", "Bintou", "Ouédraogo", "Gestionnaire des carrières", "mfp-drh", "agent", "actif", 69, 330],
    ["a25", "Hamidou", "Diallo", "Chargé de la dématérialisation", "mfp-dma", "agent", "actif", 104, 12],
    ["a26", "Céline", "Toé", "Analyste RH", "mfp-drh", "agent", "actif", 27, 95],
    ["a27", "Fatimata", "Kaboré", "Conseillère des affaires étrangères", "mae-dajc", "admin_ministeriel", "actif", 129, 26],
    ["a28", "Théophile", "Nana", "Chef du protocole adjoint", "mae-dp", "agent", "actif", 52, 140],
    ["a29", "Aïcha", "Barry", "Attachée consulaire", "mae-dajc", "agent", "revoque", 18, 12960],
    ["a30", "Wendkouni", "Zida", "Officier d'état civil", "mat-dec", "agent", "actif", 39, 80],
    ["a31", "Rose", "Kafando", "Administratrice ministérielle", "mat-dct", "admin_ministeriel", "actif", 124, 18],
    ["a32", "Idrissa", "Sawadogo", "Chargé des collectivités", "mat-dct", "agent", "actif", 12, 260],
    ["a33", "Prisca", "Ilboudo", "Archiviste", "mat-dec", "agent", "en_attente", 0, null],
    ["a34", "Souleymane", "Ouangraoua", "Technicien support", "mtd-din", "agent", "actif", 8, 44],
  ];

  const simple = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/gi, "").toLowerCase();

  const agents = lignes.map(([id, prenom, nom, fonction, direction, role, statut, jours, derniere], i) => {
    const ministere = direction.split("-")[0];
    return {
      id,
      matricule: `AGT-2026-${String(i + 101).padStart(4, "0")}`,
      prenom,
      nom,
      email: `${simple(prenom)[0]}.${simple(nom)}@${ministere}.msap.demo`,
      telephone: `+226 25 ${30 + (i % 9)} ${String(10 + i * 2).padStart(2, "0")} ${String(40 + i).slice(-2)}`,
      fonction,
      ministere_id: ministere,
      direction_id: direction,
      role,
      statut,
      enrole_le: joursAvant(jours, 8 + (i % 8)),
      derniere_connexion: derniere === null ? null : ilYA(derniere),
      appareils: statut === "actif" ? 1 + (i % 3) : 0,
      salons: statut === "actif" ? 2 + (i % 4) : 0,
    };
  });

  const audit = [
    { id: "l1", date: ilYA(31), auteur_id: "a02", action: "enrolement", cible_id: "a33", resultat: "succes", details: "Enrôlement d'un agent du MAT, activation en attente", ip: IP_ADMIN },
    { id: "l2", date: ilYA(95), auteur_id: null, action: "connexion_rejetee", cible_id: null, resultat: "echec", details: "Compte inconnu de l'annuaire : invite.externe@gmail.com", ip: "196.28.240.17" },
    { id: "l3", date: ilYA(210), auteur_id: "a14", action: "modification_role", cible_id: "a16", resultat: "succes", details: "Rôle Agent confirmé après mutation", ip: "10.22.1.5" },
    { id: "l4", date: ilYA(890), auteur_id: "a01", action: "connexion_rejetee", cible_id: "a01", resultat: "echec", details: "Second facteur invalide (3 tentatives)", ip: "41.138.97.4" },
    { id: "l5", date: ilYA(1500), auteur_id: "a09", action: "suspension", cible_id: "a12", resultat: "succes", details: "Suspension pendant une enquête administrative", ip: "10.30.0.9" },
    { id: "l6", date: joursAvant(1, 16), auteur_id: "a02", action: "enrolement", cible_id: "a17", resultat: "succes", details: "Enrôlement d'un agent du MS", ip: IP_ADMIN },
    { id: "l7", date: joursAvant(2, 10), auteur_id: "a02", action: "modification_classification", cible_id: null, resultat: "succes", details: "Confidentiel : expiration par défaut réglée à 24 heures", ip: IP_ADMIN },
    { id: "l8", date: joursAvant(5, 11), auteur_id: "a02", action: "revocation", cible_id: "a18", resultat: "succes", details: "Départ du ministère", ip: IP_ADMIN },
    { id: "l9", date: joursAvant(8, 8), auteur_id: "a02", action: "enrolement", cible_id: "a34", resultat: "succes", details: "Enrôlement d'un agent du MTD", ip: IP_ADMIN },
    { id: "l10", date: joursAvant(9, 9), auteur_id: "a27", action: "revocation", cible_id: "a29", resultat: "succes", details: "Perte du téléphone professionnel", ip: "10.50.3.2" },
    { id: "l11", date: joursAvant(12, 14), auteur_id: "a31", action: "enrolement", cible_id: "a32", resultat: "succes", details: "Enrôlement d'un agent du MAT", ip: "10.60.1.4" },
  ];

  const etapesOk = [
    { cle: "identite", ok: true },
    { cle: "sessions", ok: true },
    { cle: "appareils", ok: true },
    { cle: "salons", ok: true },
    { cle: "blocage", ok: true },
  ];

  const revocations = [
    { id: "r1", agent_id: "a18", auteur_id: "a02", date: joursAvant(5, 11), motif: "Départ du ministère", appareils: 2, salons: 3, etapes: etapesOk },
    { id: "r2", agent_id: "a29", auteur_id: "a27", date: joursAvant(9, 9), motif: "Perte du téléphone professionnel", appareils: 1, salons: 2, etapes: etapesOk },
  ];

  const classifications = [
    { id: "standard", duree_minutes: 0, transfert_interdit: false, copie_interdite: false, accuse_lecture: false, filigrane: false },
    { id: "restreint", duree_minutes: 43200, transfert_interdit: true, copie_interdite: false, accuse_lecture: true, filigrane: false },
    { id: "confidentiel", duree_minutes: 1440, transfert_interdit: true, copie_interdite: true, accuse_lecture: true, filigrane: true },
  ];

  const activite = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((jour, i) => ({
    jour,
    messages: [1840, 2160, 2030, 2410, 1980, 310, 140][i],
    fichiers: [212, 248, 231, 276, 190, 22, 9][i],
  }));

  return { ministeres, agents, audit, revocations, classifications, activite, compteur: 200 };
}

const comptes = {
  "i.sawadogo@mtd.msap.demo": "a02",
  "f.sankara@men.msap.demo": "a19",
  "a.ouedraogo@mtd.msap.demo": "a01",
  "a.barry@mae.msap.demo": "a29",
};
const MOT_DE_PASSE = "msap2026";

let memoire = null;

function lire() {
  if (memoire) return memoire;
  try {
    memoire = JSON.parse(localStorage.getItem(CLE)) || graine();
  } catch {
    memoire = graine();
  }
  return memoire;
}

function ecrire(base) {
  memoire = base;
  try {
    localStorage.setItem(CLE, JSON.stringify(base));
  } catch {
    return;
  }
  window.dispatchEvent(new Event("msap-donnees-modifiees"));
}

export function reinitialiserBase() {
  memoire = null;
  try {
    localStorage.removeItem(CLE);
  } catch {
    return;
  }
  window.dispatchEvent(new Event("msap-donnees-modifiees"));
}

function erreur(statut, message) {
  const e = new Error(message);
  e.statut = statut;
  return e;
}

function journal(base, auteurId, action, cibleId, details, resultat = "succes", ip = IP_ADMIN) {
  base.compteur += 1;
  base.audit.unshift({ id: `l${base.compteur}`, date: new Date().toISOString(), auteur_id: auteurId, action, cible_id: cibleId, resultat, details, ip });
}

function adminConnecte(base, jeton) {
  const id = jeton && jeton.startsWith("demo-session-") ? jeton.replace("demo-session-", "") : null;
  const admin = base.agents.find((a) => a.id === id);
  if (!admin || admin.statut !== "actif" || !["super_admin", "admin_ministeriel"].includes(admin.role)) {
    throw erreur(401, "Votre session a expiré. Reconnectez-vous.");
  }
  return admin;
}

function trouverAgent(base, id) {
  const agent = base.agents.find((a) => a.id === id);
  if (!agent) throw erreur(404, "Cet agent n'existe pas.");
  return agent;
}

function verifierPortee(admin, agent) {
  if (admin.role === "admin_ministeriel" && agent.ministere_id !== admin.ministere_id) {
    throw erreur(403, "Cet agent ne dépend pas de votre ministère.");
  }
}

export async function appelDemo(chemin, { methode = "GET", corps, jeton } = {}) {
  await delai();
  const base = lire();
  const [route] = chemin.split("?");
  const morceaux = route.split("/").filter(Boolean);

  if (route === "/auth/login" && methode === "POST") {
    const email = (corps.email || "").trim().toLowerCase();
    const agentId = comptes[email];
    const agent = base.agents.find((a) => a.id === agentId);
    if (!agent || corps.password !== MOT_DE_PASSE) {
      journal(base, agent ? agent.id : null, "connexion_rejetee", agent ? agent.id : null, agent ? "Mot de passe incorrect" : `Compte inconnu de l'annuaire : ${email || "vide"}`, "echec", "196.28.240.17");
      ecrire(base);
      throw erreur(401, "Identifiant ou mot de passe incorrect. Seuls les agents enrôlés peuvent se connecter.");
    }
    if (agent.statut === "revoque" || agent.statut === "suspendu") {
      journal(base, agent.id, "connexion_rejetee", agent.id, `Connexion refusée : compte ${agent.statut === "revoque" ? "révoqué" : "suspendu"}`, "echec", "196.28.240.17");
      ecrire(base);
      throw erreur(403, agent.statut === "revoque" ? "Les accès de ce compte ont été révoqués." : "Ce compte est suspendu.");
    }
    if (!["super_admin", "admin_ministeriel"].includes(agent.role)) {
      throw erreur(403, "Ce compte n'a pas les droits d'administration. Utilisez la messagerie MSAP.");
    }
    return { jeton_temporaire: `demo-attente-${agent.id}` };
  }

  if (route === "/auth/verification" && methode === "POST") {
    const id = (corps.jeton_temporaire || "").replace("demo-attente-", "");
    const agent = base.agents.find((a) => a.id === id);
    if (!agent) throw erreur(401, "Session de connexion expirée. Recommencez.");
    if (corps.code !== CODE_DEMO) {
      journal(base, agent.id, "connexion_rejetee", agent.id, "Code de second facteur invalide", "echec");
      ecrire(base);
      throw erreur(401, "Code invalide. Saisissez les 6 chiffres de votre application d'authentification.");
    }
    agent.derniere_connexion = new Date().toISOString();
    journal(base, agent.id, "connexion", null, "Connexion au portail d'administration avec second facteur");
    ecrire(base);
    return { access_token: `demo-session-${agent.id}` };
  }

  const admin = adminConnecte(base, jeton);

  if (route === "/auth/me") return admin;

  if (morceaux[0] !== "admin") throw erreur(404, "Ressource introuvable.");
  const ressource = morceaux[1];
  const id = morceaux[2];
  const action = morceaux[3];

  if (ressource === "ministeres" && methode === "GET") return base.ministeres;
  if (ressource === "audit" && methode === "GET") {
    if (admin.role === "super_admin") return base.audit;
    const miens = new Set(base.agents.filter((a) => a.ministere_id === admin.ministere_id).map((a) => a.id));
    return base.audit.filter((e) => miens.has(e.auteur_id) || miens.has(e.cible_id));
  }
  if (ressource === "revocations" && methode === "GET") {
    if (admin.role === "super_admin") return base.revocations;
    return base.revocations.filter((r) => base.agents.find((a) => a.id === r.agent_id)?.ministere_id === admin.ministere_id);
  }
  if (ressource === "statistiques" && id === "activite") return base.activite;

  if (ressource === "classifications") {
    if (methode === "GET") return base.classifications;
    if (methode === "PUT" && id) {
      if (admin.role !== "super_admin") throw erreur(403, "Seul un super administrateur peut modifier les règles.");
      const regle = base.classifications.find((c) => c.id === id);
      if (!regle) throw erreur(404, "Niveau inconnu.");
      Object.assign(regle, corps, { id });
      journal(base, admin.id, "modification_classification", null, `Règles du niveau ${id} mises à jour`);
      ecrire(base);
      return regle;
    }
  }

  if (ressource === "agents") {
    if (!id && methode === "GET") {
      return admin.role === "super_admin" ? base.agents : base.agents.filter((a) => a.ministere_id === admin.ministere_id);
    }

    if (!id && methode === "POST") {
      if (base.agents.some((a) => a.email.toLowerCase() === corps.email.toLowerCase())) throw erreur(409, "Cette adresse est déjà enrôlée.");
      if (base.agents.some((a) => a.matricule.toLowerCase() === corps.matricule.toLowerCase())) throw erreur(409, "Ce matricule existe déjà.");
      if (admin.role === "admin_ministeriel" && corps.ministere_id !== admin.ministere_id) throw erreur(403, "Vous ne pouvez enrôler que dans votre ministère.");
      base.compteur += 1;
      const agent = {
        ...corps,
        id: `a${base.compteur}`,
        statut: "en_attente",
        enrole_le: new Date().toISOString(),
        derniere_connexion: null,
        appareils: 0,
        salons: 0,
      };
      base.agents.unshift(agent);
      const m = base.ministeres.find((x) => x.id === agent.ministere_id);
      journal(base, admin.id, "enrolement", agent.id, `Enrôlement d'un agent du ${m ? m.sigle : ""}, activation en attente`);
      ecrire(base);
      const code = Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 6).toUpperCase()).join("-");
      return { agent, code_activation: code, expire_dans_heures: 72 };
    }

    const agent = trouverAgent(base, id);
    if (!action && methode === "GET") return agent;
    verifierPortee(admin, agent);

    if (!action && methode === "PATCH") {
      const ancienRole = agent.role;
      Object.assign(agent, corps);
      journal(base, admin.id, ancienRole !== agent.role ? "modification_role" : "modification_agent", agent.id, ancienRole !== agent.role ? `Rôle modifié : ${ancienRole} → ${agent.role}` : "Mise à jour des informations professionnelles");
      ecrire(base);
      return agent;
    }

    if (action === "suspension") {
      agent.statut = "suspendu";
      journal(base, admin.id, "suspension", agent.id, corps?.motif || "Suspension temporaire des accès");
      ecrire(base);
      return agent;
    }

    if (action === "reactivation") {
      agent.statut = "actif";
      journal(base, admin.id, "reactivation", agent.id, "Réactivation du compte");
      ecrire(base);
      return agent;
    }

    if (action === "activation") {
      journal(base, admin.id, "modification_agent", agent.id, "Nouveau code d'activation émis");
      ecrire(base);
      return { code_activation: Math.random().toString(36).slice(2, 10).toUpperCase(), expire_dans_heures: 72 };
    }

    if (action === "revocation") {
      if (agent.statut === "revoque") throw erreur(409, "Cet agent est déjà révoqué.");
      if (agent.id === admin.id) throw erreur(403, "Vous ne pouvez pas révoquer votre propre compte.");
      const appareils = Math.max(1, agent.appareils);
      const salons = agent.salons;
      agent.statut = "revoque";
      agent.appareils = 0;
      agent.salons = 0;
      base.compteur += 1;
      const revocation = {
        id: `r${base.compteur}`,
        agent_id: agent.id,
        auteur_id: admin.id,
        date: new Date().toISOString(),
        motif: corps.motif,
        appareils,
        salons,
        etapes: ["identite", "sessions", "appareils", "salons", "blocage"].map((cle) => ({ cle, ok: true })),
      };
      base.revocations.unshift(revocation);
      journal(base, admin.id, "revocation", agent.id, corps.motif);
      ecrire(base);
      return revocation;
    }
  }

  throw erreur(404, "Ressource introuvable.");
}

export const comptesDemo = [
  { role: "Super administrateur", email: "i.sawadogo@mtd.msap.demo" },
  { role: "Administratrice ministérielle (MEN)", email: "f.sankara@men.msap.demo" },
  { role: "Agent sans droits d'administration", email: "a.ouedraogo@mtd.msap.demo" },
  { role: "Compte révoqué", email: "a.barry@mae.msap.demo" },
  { role: "Intrus non enrôlé", email: "invite.externe@gmail.com" },
];

export const motDePasseDemo = MOT_DE_PASSE;
export const codeDemo = CODE_DEMO;
