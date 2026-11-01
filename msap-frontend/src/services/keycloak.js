import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "MSAP",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "msap-frontend",
});

let initialisation = null;

export function initialiserKeycloak() {
  if (!initialisation) {
    initialisation = keycloak.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      checkLoginIframe: false,
    });
  }

  return initialisation;
}

export function obtenirJeton() {
  return keycloak.token || null;
}

export async function obtenirJetonValide() {
  if (!keycloak.authenticated) return null;

  try {
    await keycloak.updateToken(30);
    return keycloak.token || null;
  } catch {
    window.dispatchEvent(new Event("msap-session-expiree"));
    return null;
  }
}

export function connecterKeycloak() {
  return keycloak.login();
}

export function deconnecterKeycloak() {
  return keycloak.logout({
    redirectUri: `${window.location.origin}/login`,
  });
}

export function sessionKeycloakActive() {
  return Boolean(keycloak.authenticated);
}

export default keycloak;
