$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".git")) {
  Write-Host "Lancez ce script depuis le dossier MSAP (celui qui contient .git)." -ForegroundColor Red
  exit 1
}

Expand-Archive -Path "messagerie-msap.zip" -DestinationPath "." -Force

$auteur = "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`nClaude-Session: https://claude.ai/code/session_0111AW6BVLM2hiroA1TvHiNQ"

function Etape($message, $chemins) {
  git add -A -- $chemins
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) {
    git commit -q -m $message -m $auteur
    Write-Host "Commit : $message" -ForegroundColor Green
  }
}

Etape "Messagerie : données et API de démonstration (conversations, messages classifiés, appareils)" @("msap-frontend/src/api", "msap-frontend/src/utils", "msap-frontend/src/data")
Etape "Sessions par onglet, langue de l'interface et composants partagés" @("msap-frontend/src/context", "msap-frontend/src/components/Fenetre.jsx", "msap-frontend/src/components/Fenetre.css", "msap-frontend/src/components/AvatarAgent.jsx", "msap-frontend/src/components/AvatarAgent.css", "msap-frontend/src/components/AvatarGroupe.jsx", "msap-frontend/src/components/RouteProtegee.jsx", "msap-frontend/src/components/FenetreRevocation.css", "msap-frontend/src/components/FenetreRevocation.jsx", "msap-frontend/eslint.config.js")
Etape "Messagerie : menu latéral, onglets mobiles et mise en page" @("msap-frontend/src/components/LayoutMessagerie.jsx", "msap-frontend/src/components/LayoutMessagerie.css", "msap-frontend/src/components/Messagerie/Menu.jsx", "msap-frontend/src/components/Messagerie/Menu.css")
Etape "Messagerie : conversations, bulles classifiées, composeur, pièces jointes et vocal" @("msap-frontend/src/components/Messagerie", "msap-frontend/src/pages/Messages.jsx")
Etape "Messagerie : groupes institutionnels et annuaire" @("msap-frontend/src/pages/Groupes.jsx", "msap-frontend/src/pages/Annuaire.jsx", "msap-frontend/src/pages/Espace.css")
Etape "Messagerie : fichiers partagés et messages enregistrés" @("msap-frontend/src/pages/Fichiers.jsx", "msap-frontend/src/pages/Enregistres.jsx")
Etape "Messagerie : centre de sécurité et bouton d'urgence" @("msap-frontend/src/pages/Securite.jsx", "msap-frontend/src/pages/Securite.css")
Etape "Messagerie : paramètres (présence, langue, notifications)" @("msap-frontend/src/pages/Parametres.jsx", "msap-frontend/src/pages/Parametres.css")
Etape "Routes de la messagerie et connexion des agents" @("msap-frontend/src/App.jsx", "msap-frontend/src/pages/Connexion.jsx", "msap-frontend/src/components/Portail", "msap-frontend/src")
Etape "Documentation : README du projet et du frontend" @("README.md", "msap-frontend/README.md", "msap-frontend/.env.example", "msap-frontend/index.html", "msap-frontend/public")

Remove-Item "messagerie-msap.zip"
Write-Host ""
Write-Host "Envoi sur GitHub..." -ForegroundColor Cyan
git push
Write-Host "Termine. Lancez : cd msap-frontend ; npm run dev" -ForegroundColor Cyan
