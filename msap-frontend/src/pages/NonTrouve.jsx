import { Link } from "react-router-dom";
import "./Portail.css";

export default function NonTrouve() {
  return (
    <section className="portail">
      <div className="portail-contenu">
        <span className="label">Erreur 404</span>
        <h1>Cette page n'existe pas</h1>
        <p className="portail-sous">Le lien est peut-être incorrect, ou la page a été déplacée.</p>
        <Link to="/" className="btn-primary" style={{ alignSelf: "flex-start" }}>
          Retour au tableau de bord
        </Link>
      </div>
    </section>
  );
}
