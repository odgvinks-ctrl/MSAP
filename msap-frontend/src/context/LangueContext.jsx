import { createContext, useContext, useState } from "react";
import { traductions } from "../data/traductions.js";

const LangueContext = createContext(null);
const CLE = "msap-langue";

function lireLangue() {
  try {
    return localStorage.getItem(CLE) || "fr";
  } catch {
    return "fr";
  }
}

export function LangueProvider({ children }) {
  const [langue, setLangue] = useState(lireLangue);

  function choisir(id) {
    setLangue(id);
    try {
      localStorage.setItem(CLE, id);
    } catch {
      return;
    }
  }

  function t(cle) {
    return traductions[langue]?.[cle] || traductions.fr[cle] || cle;
  }

  return <LangueContext.Provider value={{ langue, choisir, t }}>{children}</LangueContext.Provider>;
}

export function useLangue() {
  return useContext(LangueContext);
}
