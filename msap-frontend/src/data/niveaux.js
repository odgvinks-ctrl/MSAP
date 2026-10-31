import { ShieldCheck, ShieldAlert, Lock } from "lucide-react";

export const niveaux = [
  {
    id: "standard",
    nom: "Standard",
    court: "STD",
    icone: ShieldCheck,
    desc: "Communication administrative ordinaire entre agents habilités.",
  },
  {
    id: "restreint",
    nom: "Diffusion restreinte",
    court: "DR",
    icone: ShieldAlert,
    desc: "Information destinée à un groupe limité de personnes autorisées.",
  },
  {
    id: "confidentiel",
    nom: "Confidentiel",
    court: "CONF",
    icone: Lock,
    desc: "Information sensible soumise à des restrictions renforcées.",
  },
];

export const durees = [
  { minutes: 0, nom: "Sans expiration" },
  { minutes: 60, nom: "1 heure" },
  { minutes: 1440, nom: "24 heures" },
  { minutes: 10080, nom: "7 jours" },
  { minutes: 43200, nom: "30 jours" },
];
