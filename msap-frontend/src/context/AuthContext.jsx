import { createContext, useContext, useEffect, useState } from "react";
import { chargerMoi, deconnecter, sessionActive } from "../api/auth.js";

const AuthContext = createContext(null);
const CLE = "msap-admin";

function lireUtilisateur() {
  try {
    const stocke = JSON.parse(localStorage.getItem(CLE));
    return stocke && sessionActive() ? stocke : null;
  } catch {
    return null;
  }
}

function stocker(utilisateur) {
  try {
    if (utilisateur) {
      localStorage.setItem(CLE, JSON.stringify(utilisateur));
    } else {
      localStorage.removeItem(CLE);
    }
  } catch {
    return;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(lireUtilisateur);
  const id = user?.id;

  useEffect(() => {
    if (!id) return;

    function appliquer(compte) {
      if (!compte) {
        setUser(null);
        stocker(null);
        return;
      }
      setUser((actuel) => {
        if (actuel && JSON.stringify(actuel) === JSON.stringify(compte)) return actuel;
        stocker(compte);
        return compte;
      });
    }

    const actualiser = () => chargerMoi().then(appliquer, () => {});
    const expirer = () => appliquer(null);
    actualiser();
    window.addEventListener("focus", actualiser);
    window.addEventListener("msap-session-expiree", expirer);
    return () => {
      window.removeEventListener("focus", actualiser);
      window.removeEventListener("msap-session-expiree", expirer);
    };
  }, [id]);

  function enregistrer(utilisateur) {
    setUser(utilisateur);
    stocker(utilisateur);
  }

  function logout() {
    deconnecter();
    setUser(null);
    stocker(null);
  }

  return (
    <AuthContext.Provider value={{ user, enregistrer, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
