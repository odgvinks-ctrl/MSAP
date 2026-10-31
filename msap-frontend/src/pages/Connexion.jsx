import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, KeyRound, LockKeyhole, ShieldCheck, ShieldX, Smartphone } from "lucide-react";
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
  const { user, enregistrer } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur("");
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
      const admin = await verifierCode(jetonTemporaire, code);
      enregistrer(admin);
      navigate("/");
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
            La communication institutionnelle, en toute confiance. Ce portail permet aux administrateurs
            d'enrôler les agents, de révoquer leurs accès et de suivre la sécurité de la plateforme.
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

        <p className="auth-cote-bas">Hackathon 226 · Édition 2026 · Logiciel libre AGPL-3.0</p>
      </aside>

      <section className="auth-zone">
        {etape === "identifiant" ? (
          <form className="auth-carte" onSubmit={handleSubmit}>
            <span className="label">Portail d'administration</span>
            <h2>Connexion sécurisée</h2>
            <p className="auth-sous-titre">Réservé aux administrateurs enrôlés. Aucun compte ne peut être créé ici.</p>

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

            <button type="submit" className="btn-primary auth-bouton" disabled={chargement}>
              {chargement ? "Vérification..." : "Continuer"}
              {!chargement && <ArrowRight size={16} />}
            </button>

            <p className="auth-info">
              <KeyRound size={14} />
              L'authentification est assurée par le service d'identité de l'État.
            </p>
          </form>
        ) : (
          <form className="auth-carte" onSubmit={handleCode}>
            <button type="button" className="auth-retour" onClick={() => setEtape("identifiant")}>
              <ArrowLeft size={16} />
              Retour
            </button>
            <span className="auth-icone">
              <Smartphone size={20} />
            </span>
            <h2>Second facteur</h2>
            <p className="auth-sous-titre">Saisissez le code à 6 chiffres affiché par votre application d'authentification.</p>

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

            <button type="submit" className="btn-primary auth-bouton" disabled={chargement || code.length !== 6}>
              {chargement ? "Vérification..." : "Vérifier et se connecter"}
            </button>
          </form>
        )}

        {modeDemo && (
          <div className="auth-demo">
            <p>
              Comptes de démonstration fictifs · mot de passe <span className="mono">{motDePasseDemo}</span> · code{" "}
              <span className="mono">{codeDemo}</span>
            </p>
            <ul>
              {comptesDemo.map((c) => (
                <li key={c.email}>
                  <button type="button" onClick={() => choisirCompte(c.email)}>
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
