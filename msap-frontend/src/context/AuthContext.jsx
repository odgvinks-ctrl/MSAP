import { createContext, useContext, useEffect, useState } from "react";
import { chargerMoi, deconnecter, sessionActive } from "../api/auth.js";
import { modeDemo } from "../api/http.js";
import {
  initialiserKeycloak,
  sessionKeycloakActive,
  obtenirJetonValide,
  connecterKeycloak,
  deconnecterKeycloak,
} from "../services/keycloak.js";

const AuthContext = createContext(null);
const CLE = "msap-admin";

function lireUtilisateur() {
  try {
    const stocke = JSON.parse(sessionStorage.getItem(CLE));
    return stocke && sessionActive() ? stocke : null;
  } catch {
    return null;
  }
}

function stocker(utilisateur) {
  try {
    if (utilisateur) {
      sessionStorage.setItem(CLE, JSON.stringify(utilisateur));
    } else {
      sessionStorage.removeItem(CLE);
    }
  } catch {
    return;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    modeDemo ? lireUtilisateur() : null
  );
  const [loading, setLoading] = useState(!modeDemo);

  useEffect(() => {
    let actif = true;

    function appliquer(compte) {
      if (!actif) return;

      setUser(compte || null);

      if (modeDemo) {
        stocker(compte || null);
      }
    }

    async function actualiser() {
      try {
        if (!modeDemo) {
          const jeton = await obtenirJetonValide();

          if (!jeton) {
            appliquer(null);
            return;
          }
        }

        const compte = await chargerMoi();
        appliquer(compte);
      } catch {
        if (!modeDemo) appliquer(null);
      }
    }

    if (modeDemo) {
      if (sessionActive()) actualiser();
    } else {
      initialiserKeycloak()
        .then(async () => {
          if (!actif) return;

          if (sessionKeycloakActive()) {
            await actualiser();
          } else {
            appliquer(null);
          }
        })
        .catch(() => {
          appliquer(null);
        })
        .finally(() => {
          if (actif) setLoading(false);
        });
    }

    function expirer() {
      appliquer(null);

      if (modeDemo) {
        try {
          sessionStorage.setItem("msap-session-fermee", "1");
        } catch {
          return;
        }
      }
    }

    function auFocus() {
      if (modeDemo ? sessionActive() : sessionKeycloakActive()) {
        actualiser();
      }
    }

    window.addEventListener("focus", auFocus);
    window.addEventListener("msap-session-expiree", expirer);

    return () => {
      actif = false;
      window.removeEventListener("focus", auFocus);
      window.removeEventListener("msap-session-expiree", expirer);
    };
  }, []);

  function enregistrer(utilisateur) {
    setUser(utilisateur);

    if (modeDemo) {
      stocker(utilisateur);
    }
  }

  function login() {
    if (!modeDemo) {
      return connecterKeycloak();
    }
  }

  function logout() {
    setUser(null);

    if (modeDemo) {
      deconnecter();
      stocker(null);
    } else {
      return deconnecterKeycloak();
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, enregistrer, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
