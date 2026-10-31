export const roles = [
  { id: "super_admin", nom: "Super administrateur", desc: "Administration complète de la plateforme" },
  { id: "admin_ministeriel", nom: "Administrateur ministériel", desc: "Enrôle et révoque les agents de son ministère" },
  { id: "responsable_groupe", nom: "Responsable de groupe", desc: "Gère les participants de ses groupes" },
  { id: "agent", nom: "Agent", desc: "Messagerie, groupes et annuaire" },
];

export const rolesAdmin = ["super_admin", "admin_ministeriel"];

export const statuts = {
  actif: { nom: "Actif", classe: "valide" },
  en_attente: { nom: "En attente d'activation", classe: "attente" },
  suspendu: { nom: "Suspendu", classe: "suspendu" },
  revoque: { nom: "Révoqué", classe: "refuse" },
};

export function nomDe(liste, id) {
  const element = liste.find((e) => e.id === id);
  return element ? element.nom : id;
}
