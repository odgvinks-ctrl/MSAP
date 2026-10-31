export const typesFichier = {
  pdf: "PDF",
  docx: "Word",
  xlsx: "Tableur",
  pptx: "Présentation",
  image: "Image",
};

export function nomType(type) {
  return typesFichier[type] || "Fichier";
}

export const documentsDemo = [
  { nom: "Note_de_service_procedure_enrolement.pdf", type: "pdf", taille: "284 Ko", pages: 3 },
  { nom: "Rapport_activites_T3_DTD.docx", type: "docx", taille: "1,1 Mo", pages: 12 },
  { nom: "Planning_deploiement_regions.xlsx", type: "xlsx", taille: "96 Ko" },
  { nom: "Presentation_MSAP_COPIL.pptx", type: "pptx", taille: "2,7 Mo", pages: 15 },
];
