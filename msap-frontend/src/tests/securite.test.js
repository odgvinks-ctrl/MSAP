import { beforeEach, describe, expect, it, vi } from "vitest";
import { login, verifierCode, chargerMoi, deconnecter } from "../api/auth.js";
import { requete, lireJeton, ecrireJeton, modeDemo } from "../api/http.js";
import { getAgents, getAgent } from "../api/agents.js";
import { revoquerAgent, getRevocations } from "../api/revocations.js";
import { reinitialiserBase, motDePasseDemo, codeDemo } from "../api/base.js";

const SUPER_ADMIN = "i.sawadogo@mtd.msap.demo";
const ADMIN_MEN = "f.sankara@men.msap.demo";
const AGENTE = "a.ouedraogo@mtd.msap.demo";
const A_REVOQUER = "h.diallo@mfp.msap.demo";
const REVOQUE = "a.barry@mae.msap.demo";
const SUSPENDU = "a.bamogo@mef.msap.demo";
const INTRUS = "invite.externe@gmail.com";

async function connecter(email) {
  const jetonTemporaire = await login({ email, password: motDePasseDemo });
  return verifierCode(jetonTemporaire, codeDemo);
}

async function journalAudit() {
  const jeton = lireJeton();
  await connecter(SUPER_ADMIN);
  const audit = await requete("/admin/audit");
  ecrireJeton(jeton);
  return audit;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  reinitialiserBase();
});

describe("Mode de test", () => {
  it("tourne sur l'API de démonstration, sans serveur réel", () => {
    expect(modeDemo).toBe(true);
  });
});

describe("Connexion réservée aux agents enrôlés", () => {
  it("refuse un intrus non enrôlé et le consigne dans le journal", async () => {
    await expect(login({ email: INTRUS, password: motDePasseDemo })).rejects.toThrow(/Seuls les agents enrôlés/);
    const audit = await journalAudit();
    expect(audit.some((e) => e.action === "connexion_rejetee" && e.details.includes(INTRUS))).toBe(true);
  });

  it("refuse un mauvais mot de passe", async () => {
    await expect(login({ email: AGENTE, password: "mauvais" })).rejects.toThrow(/incorrect/);
    expect(lireJeton()).toBeNull();
  });

  it("refuse un compte révoqué", async () => {
    await expect(login({ email: REVOQUE, password: motDePasseDemo })).rejects.toThrow(/révoqués/);
  });

  it("refuse un compte suspendu", async () => {
    await expect(login({ email: SUSPENDU, password: motDePasseDemo })).rejects.toThrow(/suspendu/);
  });

  it("refuse les champs vides sans appeler le serveur", async () => {
    await expect(login({ email: "  ", password: "" })).rejects.toThrow(/Renseignez/);
  });
});

describe("Second facteur obligatoire (TOTP)", () => {
  it("ne délivre aucun jeton tant que le code n'est pas vérifié", async () => {
    await login({ email: AGENTE, password: motDePasseDemo });
    expect(lireJeton()).toBeNull();
  });

  it("refuse un code invalide et le consigne dans le journal", async () => {
    const jetonTemporaire = await login({ email: AGENTE, password: motDePasseDemo });
    await expect(verifierCode(jetonTemporaire, "000000")).rejects.toThrow(/Code invalide/);
    expect(lireJeton()).toBeNull();
    const audit = await journalAudit();
    expect(audit.some((e) => e.action === "connexion_rejetee" && e.details.includes("second facteur"))).toBe(true);
  });

  it("refuse un code qui n'a pas 6 chiffres", async () => {
    const jetonTemporaire = await login({ email: AGENTE, password: motDePasseDemo });
    await expect(verifierCode(jetonTemporaire, "12ab")).rejects.toThrow(/6 chiffres/);
  });

  it("ouvre la session avec le bon code", async () => {
    const moi = await connecter(AGENTE);
    expect(moi.email).toBe(AGENTE);
    expect(lireJeton()).not.toBeNull();
  });
});

describe("Accès aux routes protégées", () => {
  it("refuse une requête sans jeton", async () => {
    await expect(chargerMoi()).rejects.toThrow(/session/);
  });

  it("refuse un jeton inventé", async () => {
    ecrireJeton("jeton-invente");
    await expect(chargerMoi()).rejects.toThrow(/session/);
    expect(lireJeton()).toBeNull();
  });

  it("efface le jeton à la déconnexion", async () => {
    await connecter(AGENTE);
    deconnecter();
    expect(lireJeton()).toBeNull();
    await expect(chargerMoi()).rejects.toThrow(/session/);
  });
});

describe("Portail d'administration", () => {
  it("refuse le portail à un simple agent", async () => {
    await connecter(AGENTE);
    await expect(getAgents()).rejects.toThrow(/droits d'administration/);
    await expect(getRevocations()).rejects.toThrow(/droits d'administration/);
  });

  it("limite un administrateur ministériel à son ministère", async () => {
    const admin = await connecter(ADMIN_MEN);
    const agents = await getAgents();
    expect(agents.length).toBeGreaterThan(0);
    expect(agents.every((a) => a.ministereId === admin.ministereId)).toBe(true);
  });

  it("interdit à un administrateur ministériel de consulter un agent d'un autre ministère", async () => {
    await connecter(ADMIN_MEN);
    await expect(getAgent("a01")).rejects.toThrow(/votre ministère/);
  });

  it("interdit à un administrateur ministériel de révoquer un agent d'un autre ministère", async () => {
    await connecter(ADMIN_MEN);
    await expect(revoquerAgent("a25", "Test")).rejects.toThrow(/votre ministère/);
  });

  it("réserve la modification des règles de classification au super administrateur", async () => {
    await connecter(ADMIN_MEN);
    await expect(requete("/admin/classifications/confidentiel", { methode: "PUT", corps: { copie_interdite: false } })).rejects.toThrow(/super administrateur/);
  });

  it("empêche un administrateur de révoquer son propre compte", async () => {
    const admin = await connecter(SUPER_ADMIN);
    await expect(revoquerAgent(admin.id, "Test")).rejects.toThrow(/propre compte/);
  });

  it("exige un motif pour révoquer", async () => {
    await connecter(SUPER_ADMIN);
    await expect(revoquerAgent("a25", "   ")).rejects.toThrow(/motif/);
  });
});

describe("Révocation immédiate", () => {
  it("ferme la session de l'agent révoqué et l'empêche de revenir", async () => {
    const agent = await connecter(A_REVOQUER);
    const jetonAgent = lireJeton();

    await connecter(SUPER_ADMIN);
    const revocation = await revoquerAgent(agent.id, "Perte du téléphone");
    expect(revocation.etapes.every((e) => e.ok)).toBe(true);

    const expiree = vi.fn();
    window.addEventListener("msap-session-expiree", expiree);
    ecrireJeton(jetonAgent);
    await expect(chargerMoi()).rejects.toThrow(/session/);
    expect(expiree).toHaveBeenCalled();
    expect(lireJeton()).toBeNull();
    window.removeEventListener("msap-session-expiree", expiree);

    await expect(login({ email: A_REVOQUER, password: motDePasseDemo })).rejects.toThrow(/révoqués/);
  });

  it("consigne la révocation avec son auteur et son motif", async () => {
    const admin = await connecter(SUPER_ADMIN);
    await revoquerAgent("a25", "Départ du ministère");
    const audit = await requete("/admin/audit");
    const ligne = audit.find((e) => e.action === "revocation" && e.cible_id === "a25");
    expect(ligne.auteur_id).toBe(admin.id);
    expect(ligne.details).toBe("Départ du ministère");
  });
});
