import { useEffect, useRef } from "react";

export function useActualisation(charger, cle, ms = 5000) {
  const derniere = useRef(charger);

  useEffect(() => {
    derniere.current = charger;
  });

  useEffect(() => {
    const lancer = () => Promise.resolve(derniere.current()).catch(() => {});
    lancer();
    const minuteur = setInterval(lancer, ms);
    window.addEventListener("storage", lancer);
    window.addEventListener("msap-donnees-modifiees", lancer);
    return () => {
      clearInterval(minuteur);
      window.removeEventListener("storage", lancer);
      window.removeEventListener("msap-donnees-modifiees", lancer);
    };
  }, [cle, ms]);
}
