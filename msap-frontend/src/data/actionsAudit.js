import { KeyRound, LogIn, PauseCircle, PlayCircle, Settings2, ShieldCheck, ShieldOff, ShieldX, UserCog, UserPlus } from "lucide-react";

export const actionsAudit = [
  { id: "enrolement", nom: "Enrôlement", icone: UserPlus },
  { id: "revocation", nom: "Révocation", icone: ShieldOff },
  { id: "suspension", nom: "Suspension", icone: PauseCircle },
  { id: "reactivation", nom: "Réactivation", icone: PlayCircle },
  { id: "modification_role", nom: "Modification de rôle", icone: UserCog },
  { id: "modification_agent", nom: "Modification d'un agent", icone: Settings2 },
  { id: "modification_classification", nom: "Règles de classification", icone: ShieldCheck },
  { id: "connexion", nom: "Connexion", icone: LogIn },
  { id: "connexion_rejetee", nom: "Connexion rejetée", icone: ShieldX },
];

export function actionDe(id) {
  return actionsAudit.find((a) => a.id === id) || { id, nom: id, icone: KeyRound };
}
