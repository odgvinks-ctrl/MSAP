import { useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Building2, Clock4, MonitorSmartphone, ShieldAlert, ShieldOff, UserCheck, UserPlus, Users } from "lucide-react";
import AvatarAgent from "../components/AvatarAgent.jsx";
import { getAgents } from "../api/agents.js";
import { getMinisteres } from "../api/ministeres.js";
import { getActivite, getAudit } from "../api/audit.js";
import { useActualisation } from "../hooks/useActualisation.js";
import { actionDe } from "../data/actionsAudit.js";
import { depuis } from "../utils/texte.js";
import "./Portail.css";
import "./TableauBord.css";

const axe = { fontSize: 11, fill: "#6B7080" };

function Infobulle({ active, payload, label, unite }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="tb-infobulle">
      <strong>{label}</strong>
      <span>
        {payload[0].value.toLocaleString("fr-FR")} {unite}
      </span>
    </div>
  );
}

export default function TableauBord() {
  const [agents, setAgents] = useState([]);
  const [ministeres, setMinisteres] = useState([]);
  const [audit, setAudit] = useState([]);
  const [activite, setActivite] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [maintenant, setMaintenant] = useState(0);

  async function charger() {
    try {
      const [a, m, j, s] = await Promise.all([getAgents(), getMinisteres(), getAudit(), getActivite()]);
      setAgents(a);
      setMinisteres(m);
      setAudit(j);
      setActivite(s);
      setMaintenant(Date.now());
      setErreur("");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  useActualisation(charger, "tableau-bord", 8000);

  const compter = (statut) => agents.filter((a) => a.statut === statut).length;
  const alertes = audit.filter((e) => e.resultat === "echec" && maintenant - new Date(e.date).getTime() < 48 * 3600000);
  const sessions = agents.reduce((total, a) => total + (a.statut === "actif" ? a.appareils : 0), 0);

  const cartes = [
    { label: "Agents enrôlés", valeur: agents.length, detail: `${ministeres.length} ministères`, icone: Users, classe: "", to: "/agents" },
    { label: "Agents actifs", valeur: compter("actif"), detail: `${compter("en_attente")} en attente d'activation`, icone: UserCheck, classe: "succes", to: "/agents" },
    { label: "Agents révoqués", valeur: compter("revoque"), detail: `${compter("suspendu")} suspendu(s)`, icone: ShieldOff, classe: "alerte", to: "/revocations" },
    { label: "Ministères", valeur: ministeres.length, detail: `${ministeres.reduce((t, m) => t + m.directions.length, 0)} directions`, icone: Building2, classe: "bleu", to: "/agents" },
    { label: "Sessions actives", valeur: sessions, detail: "Appareils connectés", icone: MonitorSmartphone, classe: "" },
    { label: "Alertes (48 h)", valeur: alertes.length, detail: alertes.length ? "Tentatives rejetées" : "Aucune alerte", icone: ShieldAlert, classe: alertes.length ? "restreint" : "succes", to: "/audit" },
  ];

  const mois = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return d;
  });
  const evolution = mois.map((d) => {
    const fin = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    return {
      mois: d.toLocaleDateString("fr-FR", { month: "short" }),
      agents: agents.filter((a) => new Date(a.enroleLe).getTime() < fin).length,
    };
  });

  const parMinistere = ministeres
    .map((m) => ({ sigle: m.sigle, agents: agents.filter((a) => a.ministereId === m.id && a.statut !== "revoque").length }))
    .sort((a, b) => b.agents - a.agents);

  const derniersEnroles = [...agents].sort((a, b) => b.enroleLe.localeCompare(a.enroleLe)).slice(0, 5);
  const nomDeAgent = (id) => agents.find((a) => a.id === id)?.nomComplet;

  return (
    <section className="portail">
      <div className="portail-contenu">
        <div className="portail-entete">
          <div>
            <span className="label">Pilotage</span>
            <h1>Tableau de bord</h1>
            <p className="portail-sous">Vue d'ensemble des identités, des accès et de l'activité de la plateforme.</p>
          </div>
          <div className="portail-actions">
            <Link to="/revocations" className="btn-outline">
              <ShieldOff size={16} />
              Révoquer un agent
            </Link>
            <Link to="/enrolement" className="btn-primary">
              <UserPlus size={16} />
              Enrôler un agent
            </Link>
          </div>
        </div>

        {erreur && <p className="portail-erreur">{erreur}</p>}
        {chargement && <p className="portail-vide">Chargement...</p>}

        {!chargement && !erreur && (
          <>
            <div className="tb-cartes">
              {cartes.map((c) => {
                const Icone = c.icone;
                const contenu = (
                  <>
                    <div className="tb-carte-haut">
                      <span>{c.label}</span>
                      <span className={`tb-icone ${c.classe}`}>
                        <Icone size={15} />
                      </span>
                    </div>
                    <strong>{c.valeur}</strong>
                    <small>{c.detail}</small>
                  </>
                );
                return c.to ? (
                  <Link key={c.label} to={c.to} className="tb-carte portail-carte">
                    {contenu}
                  </Link>
                ) : (
                  <div key={c.label} className="tb-carte portail-carte">
                    {contenu}
                  </div>
                );
              })}
            </div>

            <div className="tb-grille tb-grille-large">
              <div className="portail-carte">
                <div className="portail-carte-entete">
                  <div>
                    <h2>Évolution des enrôlements</h2>
                    <p>Nombre cumulé d'agents enrôlés, fin de mois</p>
                  </div>
                </div>
                <div className="tb-graphique">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolution} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="degradeEnrolement" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#12264A" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="#12264A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#ECEAE4" />
                      <XAxis dataKey="mois" tick={axe} tickLine={false} axisLine={false} />
                      <YAxis tick={axe} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<Infobulle unite="agents" />} cursor={{ stroke: "#C29B3B" }} />
                      <Area type="monotone" dataKey="agents" stroke="#12264A" strokeWidth={2} fill="url(#degradeEnrolement)" dot={{ r: 3.5, fill: "#12264A", stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="portail-carte">
                <div className="portail-carte-entete">
                  <div>
                    <h2>Répartition par ministère</h2>
                    <p>Comptes actifs, en attente ou suspendus</p>
                  </div>
                </div>
                <div className="tb-graphique">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={parMinistere} layout="vertical" margin={{ top: 0, right: 28, left: -6, bottom: 0 }} barCategoryGap={6}>
                      <CartesianGrid horizontal={false} stroke="#ECEAE4" />
                      <XAxis type="number" tick={axe} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="sigle" tick={{ ...axe, fill: "#3A3F4B", fontWeight: 600 }} tickLine={false} axisLine={false} width={44} />
                      <Tooltip content={<Infobulle unite="agents" />} cursor={{ fill: "#F2F6FE" }} />
                      <Bar dataKey="agents" fill="#2457D6" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11, fill: "#3A3F4B" }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="tb-grille">
              <div className="portail-carte">
                <div className="portail-carte-entete">
                  <div>
                    <h2>Activité de la plateforme</h2>
                    <p>Messages chiffrés relayés cette semaine · le serveur compte, il ne lit pas</p>
                  </div>
                </div>
                <div className="tb-graphique petit">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activite} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#ECEAE4" />
                      <XAxis dataKey="jour" tick={axe} tickLine={false} axisLine={false} />
                      <YAxis tick={axe} tickLine={false} axisLine={false} />
                      <Tooltip content={<Infobulle unite="messages" />} cursor={{ fill: "#F7F6F2" }} />
                      <Bar dataKey="messages" fill="#12264A" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="portail-carte">
                <div className="portail-carte-entete">
                  <h2>Alertes de sécurité</h2>
                  <Link to="/audit">Journal</Link>
                </div>
                {alertes.length === 0 && <p className="portail-vide">Aucune tentative rejetée ces 48 dernières heures.</p>}
                <div className="portail-liste">
                  {alertes.slice(0, 4).map((e) => (
                    <div key={e.id} className="portail-ligne">
                      <AlertTriangle size={16} className="tb-alerte-icone" />
                      <div className="portail-ligne-texte">
                        <strong>{actionDe(e.action).nom}</strong>
                        <span>{e.details}</span>
                      </div>
                      <span className="portail-discret">{depuis(e.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="tb-grille">
              <div className="portail-carte">
                <div className="portail-carte-entete">
                  <h2>Derniers enrôlements</h2>
                  <Link to="/agents">Tous les agents</Link>
                </div>
                <div className="portail-liste">
                  {derniersEnroles.map((a) => (
                    <Link key={a.id} to={`/agents/${a.id}`} className="portail-ligne">
                      <AvatarAgent nom={a.nomComplet} taille={32} />
                      <div className="portail-ligne-texte">
                        <strong>{a.nomComplet}</strong>
                        <span>{a.fonction}</span>
                      </div>
                      {a.statut === "en_attente" ? (
                        <span className="tb-attente">
                          <Clock4 size={13} />
                          Activation
                        </span>
                      ) : (
                        <span className="portail-discret">{depuis(a.enroleLe)}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="portail-carte">
                <div className="portail-carte-entete">
                  <h2>Activité récente</h2>
                  <Link to="/audit">Journal d'audit</Link>
                </div>
                <div className="portail-liste">
                  {audit.slice(0, 5).map((e) => {
                    const action = actionDe(e.action);
                    const Icone = action.icone;
                    const cible = nomDeAgent(e.cibleId);
                    return (
                      <div key={e.id} className="portail-ligne">
                        <span className={e.resultat === "echec" ? "tb-icone alerte" : "tb-icone"}>
                          <Icone size={14} />
                        </span>
                        <div className="portail-ligne-texte">
                          <strong>
                            {action.nom}
                            {cible ? ` · ${cible}` : ""}
                          </strong>
                          <span>{e.details}</span>
                        </div>
                        <span className="portail-discret">{depuis(e.date)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
