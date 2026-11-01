import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import RouteProtegee from "../components/RouteProtegee.jsx";

function connecterEnTantQue(role) {
  sessionStorage.setItem("msap-jeton", "demo-session-test");
  sessionStorage.setItem("msap-admin", JSON.stringify({ id: "test", role }));
}

function ouvrir(chemin) {
  render(
    <MemoryRouter initialEntries={[chemin]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>Page de connexion</p>} />
          <Route path="/messages" element={<p>Messagerie</p>} />
          <Route
            path="/"
            element={
              <RouteProtegee roles={["super_admin", "admin_ministeriel"]}>
                <p>Portail</p>
              </RouteProtegee>
            }
          />
          <Route
            path="/ministeres"
            element={
              <RouteProtegee roles={["super_admin"]}>
                <p>Ministères</p>
              </RouteProtegee>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("RouteProtegee", () => {
  it("renvoie vers la connexion sans session", () => {
    ouvrir("/");
    expect(screen.getByText("Page de connexion")).toBeTruthy();
  });

  it("ignore un utilisateur stocké sans jeton de session", () => {
    sessionStorage.setItem("msap-admin", JSON.stringify({ id: "test", role: "super_admin" }));
    ouvrir("/");
    expect(screen.getByText("Page de connexion")).toBeTruthy();
  });

  it("renvoie un agent vers sa messagerie quand il tente d'ouvrir le portail", () => {
    connecterEnTantQue("agent");
    ouvrir("/");
    expect(screen.getByText("Messagerie")).toBeTruthy();
    expect(screen.queryByText("Portail")).toBeNull();
  });

  it("ouvre le portail à un administrateur ministériel", () => {
    connecterEnTantQue("admin_ministeriel");
    ouvrir("/");
    expect(screen.getByText("Portail")).toBeTruthy();
  });

  it("réserve la gestion des ministères au super administrateur", () => {
    connecterEnTantQue("admin_ministeriel");
    ouvrir("/ministeres");
    expect(screen.queryByText("Ministères")).toBeNull();
  });
});
