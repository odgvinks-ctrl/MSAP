import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  ShieldX,
  Smartphone,
} from "lucide-react";
import { login, verifierCode } from "../api/auth.js";
import { modeDemo } from "../api/http.js";
import { comptesDemo, motDePasseDemo, codeDemo } from "../api/base.js";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.svg";
import "./Auth.css";

export default function Connexion() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [etape, setEtape] = useState("identifiant");
  const [jetonTemporaire, setJetonTemporaire] = useState("");
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const [sessionFermee] = useState(() => {
    try {
      const fermee = sessionStorage.getItem("msap-session-fermee") === "1";
      sessionStorage.removeItem("msap-session-fermee");
      return fermee;
    } catch {
      return false;
    }
  });

  const { user, enregistrer, login: connecter, loading } = useAuth();
  const navigate = useNavigate();

  const accueil = (compte) =>
    ["super_admin", "admin_ministeriel"].includes(compte.role)
      ? "/"
      : "/messages";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Vérification de votre session...
      </div>
    );
  }

  if (user) return <Navigate to={accueil(user)} replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur("");
  }

  async function handleConnexionKeycloak() {
    setChargement(true);
    setErreur("");

    try {
      await connecter();
    } catch {
      setErreur("Impossible de contacter le service d'identité. Réessayez.");
      setChargement(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setChargement(true);

    try {
      setJetonTemporaire(await login(form));
      setEtape("code");
      setCode("");
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  async function handleCode(e) {
    e.preventDefault();
    setChargement(true);

    try {
      const compte = await verifierCode(jetonTemporaire, code);
      enregistrer(compte);
      navigate(accueil(compte));
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  function choisirCompte(email) {
    setForm({ email, password: motDePasseDemo });
    setEtape("identifiant");
    setErreur("");
  }

  const atouts = [
    { icone: LockKeyhole, titre: "Chiffrement", desc: "de bout en bout" },
    { icone: Building2, titre: "Hébergement", desc: "souverain" },
    { icone: ShieldCheck, titre: "Identité", desc: "vérifiée · 2FA" },
  ];

  return (
    <div className="auth">
      <aside className="auth-cote">
        <div className="auth-logo">
          <img src={logo} alt="" />
          <span>
            <strong>MSAP</strong>
            <small>Administration publique</small>
          </span>
        </div>

        <div className="auth-cote-texte">
          <span className="auth-trait" />
          <h1>Messagerie Souveraine de l'Administration Publique</h1>
          <p>
            La communication institutionnelle, en toute confiance. Des
            échanges chiffrés de bout en bout, hébergés sur l'infrastructure
            de l'État, réservés aux agents enrôlés.
          </p>

          <div className="auth-atouts">
            {atouts.map((a) => {
              const Icone = a.icone;

              return (
                <div key={a.titre} className="auth-atout">
                  <Icone size={16} />
                  <strong>{a.titre}</strong>
                  <span>{a.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="auth-cote-bas">
          Hackathon 226 · Édition 2026 · Logiciel libre AGPL-3.0
        </p>
      </aside>

      <section className="auth-zone">
        {!modeDemo ? (
          <div className="auth-carte">
            <span className="label">Agents de l'administration</span>
            <h2>Connexion sécurisée</h2>
            <p className="auth-sous-titre">
              Accès réservé aux agents enrôlés. Aucun compte ne peut être créé
              depuis cette interface.
            </p>

            {sessionFermee && (
              <div className="auth-erreur">
                <ShieldX size={16} />
                <span>
                  Votre session a été fermée. Si vos accès ont été révoqués,
                  contactez votre administrateur ministériel.
                </span>
              </div>
            )}

            {erreur && (
              <div className="auth-erreur">
                <ShieldX size={16} />
                <span>{erreur}</span>
              </div>
            )}

            <button
              type="button"
              className="btn-primary auth-bouton"
              onClick={handleConnexionKeycloak}
              disabled={chargement}
            >
              {chargement ? "Redirection..." : "Se connecter avec MSAP"}
              {!chargement && <ArrowRight size={16} />}
            </button>

            <p className="auth-info">
              <KeyRound size={14} />
              Votre identité et votre double authentification sont gérées par
              le service sécurisé de l'État.
            </p>
          </div>
        ) : etape === "identifiant" ? (
          <form className="auth-carte" onSubmit={handleSubmit}>
            <span className="label">Agents de l'administration</span>
            <h2>Connexion sécurisée</h2>
            <p className="auth-sous-titre">
              Mode démonstration : utilisez un compte fictif.
            </p>

            <label className="champ">
              Adresse professionnelle
              <input
                type="email"
                name="email"
                placeholder="prenom.nom@ministere.msap.demo"
                value={form.email}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </label>

            <label className="champ">
              Mot de passe
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </label>

            {erreur && (
              <div className="auth-erreur">
                <ShieldX size={16} />
                <span>{erreur}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary auth-bouton"
              disabled={chargement}
            >
              {chargement ? "Vérification..." : "Continuer"}
              {!chargement && <ArrowRight size={16} />}
            </button>
          </form>
        ) : (
          <form className="auth-carte" onSubmit={handleCode}>
            <button
              type="button"
              className="auth-retour"
              onClick={() => setEtape("identifiant")}
            >
              <ArrowLeft size={16} />
              Retour
            </button>

            <span className="auth-icone">
              <Smartphone size={20} />
            </span>
            <h2>Second facteur</h2>
            <p className="auth-sous-titre">
              Saisissez le code à 6 chiffres de votre application
              d'authentification.
            </p>

            <input
              className="auth-code mono"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setErreur("");
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              aria-label="Code à 6 chiffres"
              autoFocus
            />

            {erreur && (
              <div className="auth-erreur">
                <ShieldX size={16} />
                <span>{erreur}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary auth-bouton"
              disabled={chargement || code.length !== 6}
            >
              {chargement ? "Vérification..." : "Vérifier et se connecter"}
            </button>
          </form>
        )}

        {modeDemo && (
          <div className="auth-demo">
            <p>
              Comptes de démonstration fictifs · mot de passe{" "}
              <span className="mono">{motDePasseDemo}</span> · code{" "}
              <span className="mono">{codeDemo}</span>
            </p>

            <ul>
              {comptesDemo.map((c) => (
                <li key={c.email}>
                  <button
                    type="button"
                    onClick={() => choisirCompte(c.email)}
                  >
                    <span>{c.role}</span>
                    <span className="mono">{c.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
