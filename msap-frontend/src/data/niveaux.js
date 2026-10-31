import { ShieldCheck, ShieldAlert, Lock } from "lucide-react";

export const niveaux = [
  {
    id: "standard",
    nom: "Standard",
    court: "STD",
    icone: ShieldCheck,
    desc: "Communication administrative ordinaire entre agents habilités.",
    regles: ["Chiffrement de bout en bout", "Transfert autorisé entre agents enrôlés"],
  },
  {
    id: "restreint",
    nom: "Diffusion restreinte",
    court: "DR",
    icone: ShieldAlert,
    desc: "Information destinée à un groupe limité de personnes autorisées.",
    regles: ["Transfert interdit", "Expiration après 30 jours", "Filigrane nominatif sur les fichiers"],
  },
  {
    id: "confidentiel",
    nom: "Confidentiel",
    court: "CONF",
    icone: Lock,
    desc: "Information sensible soumise à des restrictions renforcées.",
    regles: ["Destinataires nominatifs", "Copie et transfert interdits", "Expiration courte et accusé de lecture"],
  },
];

export const durees = [
  { minutes: 0, nom: "Sans expiration" },
  { minutes: 60, nom: "1 heure" },
  { minutes: 1440, nom: "24 heures" },
  { minutes: 10080, nom: "7 jours" },
  { minutes: 43200, nom: "30 jours" },
];
