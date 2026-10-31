import { FileImage, FileSpreadsheet, FileText, Presentation } from "lucide-react";

const icones = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  pptx: Presentation,
  image: FileImage,
};

export default function IconeFichier({ type, taille = 40 }) {
  const Icone = icones[type] || FileText;
  return (
    <span className={`icone-fichier ${type}`} style={{ width: taille, height: taille }}>
      <Icone size={taille * 0.45} />
    </span>
  );
}
