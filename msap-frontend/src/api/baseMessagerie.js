function ilYA(minutes) {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

function dans(minutes) {
  return new Date(Date.now() + minutes * 60000).toISOString();
}

function joursAvant(jours, heure = 9) {
  const d = new Date(Date.now() - jours * 86400000);
  d.setHours(heure, 0, 0, 0);
  return d.toISOString();
}

const membre = (agent_id, role = "membre") => ({ agent_id, role });

export function graineMessagerie() {
  const conversations = [
    {
      id: "c-cellule",
      type: "groupe",
      titre: "Cellule Messagerie souveraine",
      description: "Coordination interministérielle du déploiement de MSAP",
      categorie: "interministeriel",
      classification: "restreint",
      membres: [membre("a04", "responsable"), membre("a01"), membre("a02"), membre("a08"), membre("a13"), membre("a23"), membre("a25")],
      epingle: true,
      cree_le: joursAvant(40),
    },
    { id: "c-zongo", type: "direct", classification: "standard", membres: [membre("a01"), membre("a08")], cree_le: joursAvant(22) },
    {
      id: "c-securite",
      type: "groupe",
      titre: "Points focaux sécurité SI",
      description: "Veille et réponse aux incidents de sécurité",
      categorie: "travail",
      classification: "confidentiel",
      membres: [membre("a02", "responsable"), membre("a01"), membre("a05"), membre("a06"), membre("a14")],
      cree_le: joursAvant(60),
    },
    { id: "c-compaore", type: "direct", classification: "standard", membres: [membre("a01"), membre("a13")], cree_le: joursAvant(15) },
    {
      id: "c-copil",
      type: "groupe",
      titre: "COPIL e-Administration",
      description: "Comité de pilotage du programme de dématérialisation",
      categorie: "projet",
      classification: "standard",
      membres: [membre("a23", "responsable"), membre("a01"), membre("a09"), membre("a19"), membre("a27"), membre("a31")],
      cree_le: joursAvant(90),
    },
    {
      id: "c-dtd",
      type: "groupe",
      titre: "DTD · Service coordination",
      description: "Échanges internes du service",
      categorie: "direction",
      classification: "standard",
      membres: [membre("a01", "responsable"), membre("a04"), membre("a07"), membre("a34")],
      cree_le: joursAvant(120),
    },
    { id: "c-traore", type: "direct", classification: "standard", membres: [membre("a01"), membre("a23")], cree_le: joursAvant(30) },
    { id: "c-kabore", type: "direct", classification: "standard", membres: [membre("a01"), membre("a27")], cree_le: joursAvant(9) },
  ];

  let n = 0;
  const m = (conversation_id, auteur_id, minutes, texte, extra = {}) => ({
    id: `m${++n}`,
    conversation_id,
    auteur_id,
    texte,
    envoye_le: ilYA(minutes),
    classification: "standard",
    expire_le: null,
    restrictions: null,
    repond_a: null,
    reactions: [],
    piece: null,
    vocal: null,
    lu: true,
    systeme: false,
    accuses: [],
    ...extra,
  });
  const restrictions = (destinataires, duree_minutes, copie = true) => ({
    destinataires,
    transfert_interdit: true,
    copie_interdite: copie,
    lecture_unique: false,
    accuse_obligatoire: true,
    duree_minutes,
  });

  const messages = [
    m("c-cellule", "a04", 1460, "Bonjour à tous. Le compte rendu de la réunion de cadrage est disponible ci-dessous.", {
      piece: { nom: "CR_reunion_cadrage_MSAP.pdf", type: "pdf", taille: "412 Ko", pages: 6 },
    }),
    m("c-cellule", "a08", 1440, "Merci. Côté MEF, la ligne budgétaire pour l'hébergement est confirmée pour le T1.", {
      reactions: [{ emoji: "👍", auteurs: ["a04", "a01"] }],
    }),
    m("c-cellule", "a02", 300, "Rappel : les codes d'enrôlement de la phase pilote ne doivent circuler que via MSAP.", {
      classification: "restreint",
      expire_le: dans(60 * 24 * 7),
      restrictions: { ...restrictions([], 60 * 24 * 7, false) },
      accuses: ["a04"],
    }),
    m("c-cellule", "a13", 240, "Bien noté. Le ministère de la Santé peut-il intégrer les 12 points focaux régionaux dès la semaine prochaine ?"),
    m("c-cellule", "a02", 180, "", {
      classification: "confidentiel",
      expire_le: ilYA(20),
      restrictions: restrictions(["a04", "a01"], 160),
    }),
    m("c-cellule", "a23", 42, "", { vocal: { duree: 38 }, lu: false }),
    m("c-cellule", "a04", 18, "Réunion de suivi jeudi à 10 h, salle de conférence du MTD. Merci de confirmer votre présence.", {
      lu: false,
      reactions: [{ emoji: "✅", auteurs: ["a08"] }],
    }),
    m("c-cellule", "a25", 12, "Je confirme ma présence.", { lu: false }),

    m("c-zongo", "a08", 2900, "Bonjour Madame Ouédraogo, avez-vous pu consulter le projet de budget du volet numérique ?"),
    m("c-zongo", "a01", 2880, "Bonjour Monsieur Zongo. Oui, j'ai deux observations sur la ligne formation. Je vous les envoie aujourd'hui."),
    m("c-zongo", "a01", 2870, "Voici le tableau annoté.", {
      piece: { nom: "Budget_volet_numerique_2027_annote.xlsx", type: "xlsx", taille: "88 Ko" },
    }),
    m("c-zongo", "a08", 26, "Merci, c'est bien reçu. Pouvons-nous en discuter avant la session budgétaire de lundi ?", { lu: false }),

    m("c-securite", "a05", 4300, "Tentative d'hameçonnage détectée ciblant des adresses de la DGI. Vigilance sur les pièces jointes .zip.", {
      classification: "restreint",
    }),
    m("c-securite", "a02", 4280, "Merci Pauline. Note de sensibilisation jointe, à relayer dans vos directions.", {
      piece: { nom: "Note_sensibilisation_hameconnage.pdf", type: "pdf", taille: "236 Ko", pages: 2 },
    }),
    m("c-securite", "a14", 1300, "Le MS a appliqué les correctifs sur les postes exposés. Rapport à venir."),
    m("c-securite", "a06", 95, "Rapport d'audit des accès VPN du trimestre.", {
      classification: "confidentiel",
      expire_le: dans(60 * 24 * 2),
      restrictions: restrictions(["a02", "a01", "a05"], 60 * 24 * 3),
      piece: { nom: "Audit_acces_VPN_T3.pdf", type: "pdf", taille: "1,2 Mo", pages: 14 },
    }),

    m("c-compaore", "a13", 1600, "Bonjour Aminata, pour le tableau de bord vaccinal, nous aurons besoin d'un canal sécurisé avec les districts."),
    m("c-compaore", "a01", 1580, "Bonjour Mariam. Nous pouvons créer un groupe dédié dès l'enrôlement des points focaux.", {
      reactions: [{ emoji: "🙏", auteurs: ["a13"] }],
    }),
    m("c-compaore", "a13", 1500, "Parfait. Je vous partage la maquette du tableau de bord.", {
      piece: { nom: "Maquette_tableau_bord_vaccinal.png", type: "image", taille: "640 Ko" },
    }),

    m("c-copil", "a23", 10100, "Ordre du jour du prochain COPIL.", {
      piece: { nom: "ODJ_COPIL_e-Administration.docx", type: "docx", taille: "54 Ko", pages: 2 },
    }),
    m("c-copil", "a27", 10000, "Le MAE présentera l'avancement de la légalisation en ligne."),
    m("c-copil", "a19", 5800, "Présentation du MEN sur la dématérialisation des examens.", {
      piece: { nom: "MEN_dematerialisation_examens.pptx", type: "pptx", taille: "3,4 Mo", pages: 18 },
    }),
    m("c-copil", "a31", 2400, "Le MAT confirme la participation de deux préfectures pilotes."),

    m("c-dtd", "a04", 720, "Le planning des astreintes de novembre est validé."),
    m("c-dtd", "a34", 680, "Je prends l'astreinte du 15. Merci."),
    m("c-dtd", "a01", 660, "Merci à tous. Pensez à activer vos codes de second facteur avant vendredi.", {
      reactions: [{ emoji: "👍", auteurs: ["a04", "a34"] }],
    }),

    m("c-traore", "a23", 3000, "Aminata, le décret sur la signature électronique est en relecture au SGG."),
    m("c-traore", "a01", 2950, "Merci pour l'information, Monsieur le Directeur."),

    m("c-kabore", "a27", 4100, "Bonjour, pouvez-vous me transmettre la fiche technique de MSAP pour la note diplomatique ?"),
    m("c-kabore", "a01", 4000, "Bonjour Madame Kaboré. La voici.", {
      piece: { nom: "Fiche_technique_MSAP.pdf", type: "pdf", taille: "318 Ko", pages: 4 },
    }),
  ];

  const lectures = {
    a01: {
      "c-cellule": messages.find((x) => x.auteur_id === "a02" && x.classification === "confidentiel").envoye_le,
      "c-zongo": ilYA(2870),
      "c-securite": ilYA(1),
      "c-compaore": ilYA(1),
      "c-copil": ilYA(1),
      "c-dtd": ilYA(1),
      "c-traore": ilYA(1),
      "c-kabore": ilYA(1),
    },
  };

  const appareils = {
    a01: [
      { id: "d1", nom: "Poste de travail DTD-014", type: "ordinateur", navigateur: "Firefox · Ubuntu 24.04", lieu: "Ouagadougou, MTD", ip: "10.12.4.38", derniere_activite: ilYA(1), verifie: true },
      { id: "d2", nom: "Téléphone professionnel", type: "mobile", navigateur: "Application MSAP · Android 14", lieu: "Ouagadougou", ip: "10.40.18.7", derniere_activite: ilYA(54), verifie: true },
      { id: "d3", nom: "Tablette de réunion", type: "tablette", navigateur: "Application MSAP · iPadOS 18", lieu: "Ouagadougou, salle COPIL", ip: "10.12.9.102", derniere_activite: joursAvant(3, 15), verifie: false },
    ],
  };

  const connexions = {
    a01: [
      { id: "h2", date: ilYA(55), appareil: "Téléphone professionnel", lieu: "Ouagadougou", resultat: "succes" },
      { id: "h3", date: ilYA(890), appareil: "Navigateur inconnu", lieu: "Hors réseau administratif", resultat: "echec" },
      { id: "h4", date: ilYA(1460), appareil: "Poste de travail DTD-014", lieu: "Ouagadougou", resultat: "succes" },
      { id: "h5", date: joursAvant(3, 15), appareil: "Tablette de réunion", lieu: "Ouagadougou", resultat: "succes" },
    ],
  };

  return { conversations, messages, lectures, appareils, connexions, enregistres: { a01: ["m3", "m14"] } };
}

function erreur(statut, message) {
  const e = new Error(message);
  e.statut = statut;
  return e;
}

function appareilsDe(base, agent) {
  if (!base.appareils[agent.id]) {
    base.appareils[agent.id] = Array.from({ length: agent.appareils || 0 }, (_, i) => ({
      id: `d-${agent.id}-${i}`,
      nom: i === 0 ? "Poste de travail" : "Téléphone professionnel",
      type: i === 0 ? "ordinateur" : "mobile",
      navigateur: i === 0 ? "Navigateur · Windows 11" : "Application MSAP · Android",
      lieu: "Ouagadougou",
      ip: `10.20.${i}.${10 + i}`,
      derniere_activite: agent.derniere_connexion,
      verifie: true,
    }));
  }
  return base.appareils[agent.id];
}

export function noterConnexion(base, agent) {
  base.connexions[agent.id] = [
    { id: `h${Date.now()}`, date: new Date().toISOString(), appareil: "Ce navigateur", lieu: "Ouagadougou", resultat: "succes" },
    ...(base.connexions[agent.id] || []),
  ].slice(0, 12);
  const liste = appareilsDe(base, agent);
  if (!liste.some((d) => d.courant)) {
    liste.unshift({ id: `d-${agent.id}-web`, nom: "Ce navigateur", type: "ordinateur", navigateur: "Navigateur web", lieu: "Ouagadougou", ip: "10.12.4.38", derniere_activite: new Date().toISOString(), verifie: true, courant: true });
  }
  agent.appareils = liste.length;
}

function systeme(base, conversationId, auteurId, texte) {
  base.compteur += 1;
  base.messages.push({
    id: `m${base.compteur}`,
    conversation_id: conversationId,
    auteur_id: auteurId,
    texte,
    envoye_le: new Date().toISOString(),
    classification: "standard",
    expire_le: null,
    restrictions: null,
    repond_a: null,
    reactions: [],
    piece: null,
    vocal: null,
    lu: true,
    systeme: true,
    accuses: [],
  });
}

export function retirerDesSalons(base, agent, auteurId) {
  let salons = 0;
  for (const c of base.conversations) {
    if (!c.membres.some((x) => x.agent_id === agent.id)) continue;
    salons += 1;
    if (c.type === "groupe") {
      c.membres = c.membres.filter((x) => x.agent_id !== agent.id);
      systeme(base, c.id, auteurId, `${agent.prenom} ${agent.nom} a été retiré · accès révoqué par l'administration · clés du groupe renouvelées`);
    }
  }
  const appareils = appareilsDe(base, agent).length;
  base.appareils[agent.id] = [];
  return { salons, appareils };
}

function compterSalons(base, agentId) {
  return base.conversations.filter((c) => c.membres.some((x) => x.agent_id === agentId)).length;
}

export function salonsDe(base, agentId) {
  return compterSalons(base, agentId);
}

function versClient(base, msg, moi) {
  const expire = msg.expire_le && new Date(msg.expire_le).getTime() <= Date.now();
  const autorise = !msg.restrictions || !msg.restrictions.destinataires.length || msg.auteur_id === moi || msg.restrictions.destinataires.includes(moi);
  const masque = expire || (msg.classification === "confidentiel" && !autorise);
  return {
    ...msg,
    texte: masque ? "" : msg.texte,
    piece: masque ? null : msg.piece,
    vocal: masque ? null : msg.vocal,
    expire: Boolean(expire),
    autorise,
  };
}

function conversationPour(base, c, moi) {
  const lu = base.lectures[moi]?.[c.id] || c.cree_le;
  const siens = base.messages.filter((x) => x.conversation_id === c.id);
  const dernier = siens.reduce((a, b) => (!a || b.envoye_le > a.envoye_le ? b : a), null);
  return {
    ...c,
    non_lus: siens.filter((x) => x.auteur_id !== moi && !x.systeme && x.envoye_le > lu).length,
    dernier: dernier ? versClient(base, dernier, moi) : null,
  };
}

function maConversation(base, id, moi) {
  const c = base.conversations.find((x) => x.id === id);
  if (!c || !c.membres.some((x) => x.agent_id === moi)) throw erreur(404, "Conversation introuvable ou accès retiré.");
  return c;
}

export function routeMessagerie(base, moi, route, methode, corps, ecrire) {
  const morceaux = route.split("/").filter(Boolean).slice(1);
  const [ressource, id, action] = morceaux;
  const agent = base.agents.find((a) => a.id === moi);

  if (ressource === "annuaire" && methode === "GET") {
    return base.agents
      .filter((a) => a.statut === "actif" || a.statut === "en_attente")
      .map((a) => ({ id: a.id, prenom: a.prenom, nom: a.nom, email: a.email, telephone: a.telephone, fonction: a.fonction, ministere_id: a.ministere_id, direction_id: a.direction_id, statut: a.statut, presence: a.presence }));
  }

  if (ressource === "ministeres" && methode === "GET") return base.ministeres;
  if (ressource === "regles" && methode === "GET") return base.classifications;

  if (ressource === "presence" && methode === "PUT") {
    agent.presence = corps.presence;
    ecrire(base);
    return { presence: agent.presence };
  }

  if (ressource === "conversations") {
    if (!id && methode === "GET") {
      return base.conversations
        .filter((c) => c.membres.some((x) => x.agent_id === moi))
        .map((c) => conversationPour(base, c, moi));
    }

    if (!id && methode === "POST") {
      if (corps.type === "direct") {
        const autre = base.agents.find((a) => a.id === corps.agent_id && a.statut === "actif");
        if (!autre) throw erreur(404, "Cet agent n'est pas disponible.");
        const existante = base.conversations.find((c) => c.type === "direct" && c.membres.some((x) => x.agent_id === moi) && c.membres.some((x) => x.agent_id === autre.id));
        if (existante) return conversationPour(base, existante, moi);
        base.compteur += 1;
        const c = { id: `c${base.compteur}`, type: "direct", classification: "standard", membres: [membre(moi), membre(autre.id)], cree_le: new Date().toISOString() };
        base.conversations.unshift(c);
        ecrire(base);
        return conversationPour(base, c, moi);
      }
      if (!corps.titre || corps.titre.trim().length < 3) throw erreur(400, "Le nom du groupe doit comporter au moins 3 caractères.");
      if (!corps.membres || !corps.membres.length) throw erreur(400, "Ajoutez au moins un participant.");
      base.compteur += 1;
      const c = {
        id: `c${base.compteur}`,
        type: "groupe",
        titre: corps.titre.trim(),
        description: (corps.description || "").trim(),
        categorie: corps.categorie,
        classification: corps.classification,
        membres: [membre(moi, "responsable"), ...corps.membres.map((x) => membre(x))],
        cree_le: new Date().toISOString(),
      };
      base.conversations.unshift(c);
      systeme(base, c.id, moi, `Groupe créé · ${c.membres.length} participants · clés de chiffrement générées sur les appareils des membres`);
      ecrire(base);
      return conversationPour(base, c, moi);
    }

    const c = maConversation(base, id, moi);

    if (!action && methode === "GET") return conversationPour(base, c, moi);

    if (action === "messages" && methode === "GET") {
      base.lectures[moi] = { ...(base.lectures[moi] || {}), [c.id]: new Date().toISOString() };
      ecrire(base);
      return base.messages
        .filter((x) => x.conversation_id === c.id)
        .sort((a, b) => a.envoye_le.localeCompare(b.envoye_le))
        .map((x) => versClient(base, x, moi));
    }

    if (action === "messages" && methode === "POST") {
      if (!corps.texte?.trim() && !corps.piece && !corps.vocal) throw erreur(400, "Le message est vide.");
      if (c.type === "direct") {
        const autreId = c.membres.find((x) => x.agent_id !== moi)?.agent_id;
        const autre = base.agents.find((a) => a.id === autreId);
        if (!autre || autre.statut !== "actif") throw erreur(403, "Cet agent n'a plus accès à la messagerie.");
      }
      const regle = base.classifications.find((r) => r.id === corps.classification);
      const duree = corps.restrictions?.duree_minutes ?? regle?.duree_minutes ?? 0;
      base.compteur += 1;
      const msg = {
        id: `m${base.compteur}`,
        conversation_id: c.id,
        auteur_id: moi,
        texte: (corps.texte || "").trim(),
        envoye_le: new Date().toISOString(),
        classification: corps.classification || "standard",
        expire_le: duree ? new Date(Date.now() + duree * 60000).toISOString() : null,
        restrictions: corps.restrictions || null,
        repond_a: corps.repond_a || null,
        reactions: [],
        piece: corps.piece || null,
        vocal: corps.vocal || null,
        lu: false,
        systeme: false,
        accuses: [],
      };
      base.messages.push(msg);
      base.lectures[moi] = { ...(base.lectures[moi] || {}), [c.id]: msg.envoye_le };
      ecrire(base);
      setTimeout(() => {
        const suivante = JSON.parse(localStorage.getItem("msap-base-v1") || "null");
        if (!suivante) return;
        const cible = suivante.messages.find((x) => x.id === msg.id);
        if (!cible) return;
        cible.lu = true;
        if (cible.restrictions?.accuse_obligatoire) cible.accuses = [...cible.restrictions.destinataires].slice(0, Math.max(1, cible.restrictions.destinataires.length - 1));
        ecrire(suivante);
      }, 2500);
      return versClient(base, msg, moi);
    }

    if (action === "membres" && methode === "POST") {
      if (!c.membres.some((x) => x.agent_id === moi && x.role === "responsable")) throw erreur(403, "Seuls les responsables du groupe peuvent modifier les participants.");
      const nom = (aid) => {
        const a = base.agents.find((x) => x.id === aid);
        return a ? `${a.prenom} ${a.nom}` : aid;
      };
      for (const aid of corps.ajout || []) {
        if (c.membres.some((x) => x.agent_id === aid)) continue;
        c.membres.push(membre(aid));
        systeme(base, c.id, moi, `${nom(aid)} a été ajouté au groupe`);
      }
      for (const aid of corps.retrait || []) {
        c.membres = c.membres.filter((x) => x.agent_id !== aid);
        systeme(base, c.id, moi, `${nom(aid)} a été retiré du groupe · clés de groupe renouvelées`);
      }
      ecrire(base);
      return conversationPour(base, c, moi);
    }

    if (action === "responsables" && methode === "POST") {
      if (!c.membres.some((x) => x.agent_id === moi && x.role === "responsable")) throw erreur(403, "Seuls les responsables du groupe peuvent changer les rôles.");
      c.membres = c.membres.map((x) => (x.agent_id === corps.agent_id ? { ...x, role: x.role === "responsable" ? "membre" : "responsable" } : x));
      ecrire(base);
      return conversationPour(base, c, moi);
    }
  }

  if (ressource === "messages" && id) {
    const msg = base.messages.find((x) => x.id === id);
    if (!msg) throw erreur(404, "Message introuvable.");
    maConversation(base, msg.conversation_id, moi);

    if (action === "reactions" && methode === "POST") {
      const existe = msg.reactions.find((r) => r.emoji === corps.emoji);
      if (existe) {
        existe.auteurs = existe.auteurs.includes(moi) ? existe.auteurs.filter((x) => x !== moi) : [...existe.auteurs, moi];
        msg.reactions = msg.reactions.filter((r) => r.auteurs.length);
      } else {
        msg.reactions.push({ emoji: corps.emoji, auteurs: [moi] });
      }
      ecrire(base);
      return versClient(base, msg, moi);
    }

    if (action === "accuse" && methode === "POST") {
      if (!msg.accuses.includes(moi)) msg.accuses.push(moi);
      ecrire(base);
      return versClient(base, msg, moi);
    }

    if (action === "transfert" && methode === "POST") {
      if (msg.classification !== "standard" || msg.restrictions?.transfert_interdit) throw erreur(403, "Le transfert de ce message est interdit par sa classification.");
      const vers = maConversation(base, corps.conversation_id, moi);
      return routeMessagerie(base, moi, `/messagerie/conversations/${vers.id}/messages`, "POST", { texte: msg.texte, piece: msg.piece, classification: "standard" }, ecrire);
    }
  }

  if (ressource === "enregistres") {
    const liste = base.enregistres[moi] || [];
    if (!id && methode === "GET") {
      return liste
        .map((mid) => base.messages.find((x) => x.id === mid))
        .filter((x) => x && base.conversations.some((c) => c.id === x.conversation_id && c.membres.some((y) => y.agent_id === moi)))
        .map((x) => versClient(base, x, moi));
    }
    if (id && methode === "POST") {
      base.enregistres[moi] = liste.includes(id) ? liste.filter((x) => x !== id) : [id, ...liste];
      ecrire(base);
      return { enregistres: base.enregistres[moi] };
    }
  }

  if (ressource === "fichiers" && methode === "GET") {
    const mesSalons = new Set(base.conversations.filter((c) => c.membres.some((x) => x.agent_id === moi)).map((c) => c.id));
    return base.messages
      .filter((x) => x.piece && mesSalons.has(x.conversation_id))
      .map((x) => versClient(base, x, moi))
      .filter((x) => x.piece)
      .sort((a, b) => b.envoye_le.localeCompare(a.envoye_le));
  }

  if (ressource === "appareils") {
    const liste = appareilsDe(base, agent);
    if (!id && methode === "GET") return liste;
    if (id && methode === "DELETE") {
      base.appareils[moi] = liste.filter((d) => d.id !== id);
      agent.appareils = base.appareils[moi].length;
      ecrire(base);
      return null;
    }
  }

  if (ressource === "urgence" && methode === "POST") {
    const liste = appareilsDe(base, agent);
    const appareil = liste.find((d) => d.id === corps.appareil_id);
    if (!appareil) throw erreur(404, "Appareil introuvable.");
    base.appareils[moi] = liste.filter((d) => d.id !== appareil.id);
    agent.appareils = base.appareils[moi].length;
    base.compteur += 1;
    base.audit.unshift({ id: `l${base.compteur}`, date: new Date().toISOString(), auteur_id: moi, action: "connexion_rejetee", cible_id: moi, resultat: "echec", details: `Bouton d'urgence : appareil « ${appareil.nom} » signalé perdu, session révoquée`, ip: "10.12.4.38" });
    ecrire(base);
    return null;
  }

  if (ressource === "connexions" && methode === "GET") return base.connexions[moi] || [];

  throw erreur(404, "Ressource introuvable.");
}
