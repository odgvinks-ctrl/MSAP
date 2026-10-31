$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".git")) {
  Write-Host "Lancez ce script depuis le dossier MSAP (celui qui contient .git)." -ForegroundColor Red
  exit 1
}

Expand-Archive -Path "portail-msap.zip" -DestinationPath "." -Force
Remove-Item "msap-frontend\src\App.css", "msap-frontend\src\assets\hero.png", "msap-frontend\src\assets\react.svg", "msap-frontend\src\assets\vite.svg" -ErrorAction SilentlyContinue

$auteur = "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

function Etape($message, $chemins) {
  git add -A -- $chemins
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) {
    git commit -q -m $message -m $auteur
    Write-Host "Commit : $message" -ForegroundColor Green
  }
}

$f = "msap-frontend"
Etape "Charte graphique, polices et logo MSAP" @("$f/src/index.css", "$f/src/main.jsx", "$f/index.html", "$f/public", "$f/src/assets", "$f/eslint.config.js")
Etape "Couche API, données de démonstration et utilitaires" @("$f/src/api", "$f/src/utils", "$f/src/hooks", "$f/src/data")
Etape "Session administrateur et connexion à deux facteurs" @("$f/src/context", "$f/src/components/RouteProtegee.jsx", "$f/src/pages/Connexion.jsx", "$f/src/pages/Auth.css")
Etape "Menu, en-tête et routes du portail" @("$f/src/App.jsx", "$f/src/components/Layout.jsx", "$f/src/components/Layout.css", "$f/src/components/Portail", "$f/src/components/AvatarAgent.jsx", "$f/src/components/AvatarAgent.css", "$f/src/pages/Portail.css", "$f/src/pages/NonTrouve.jsx")
Etape "Tableau de bord avec statistiques et alertes" @("$f/src/pages/TableauBord.jsx", "$f/src/pages/TableauBord.css")
Etape "Liste et fiche des agents" @("$f/src/pages/Agents.jsx", "$f/src/pages/FicheAgent.jsx", "$f/src/pages/FicheAgent.css")
Etape "Enrôlement des agents" @("$f/src/pages/Enrolement.jsx", "$f/src/pages/Enrolement.css")
Etape "Révocation immédiate en deux étapes" @("$f/src/components/FenetreRevocation.jsx", "$f/src/components/FenetreRevocation.css", "$f/src/pages/Revocations.jsx", "$f/src/pages/Revocations.css")
Etape "Règles de classification des messages" @("$f/src/pages/Classifications.jsx", "$f/src/pages/Classifications.css")
Etape "Ministères, rôles et journal d'audit" @("$f/src/pages/Ministeres.jsx", "$f/src/pages/Ministeres.css", "$f/src/pages/Roles.jsx", "$f/src/pages/Roles.css", "$f/src/pages/Audit.jsx", "$f/src/pages/Audit.css")
Etape "Habillage d'Element Web et documentation du portail" @("element", "$f/README.md", "$f/.env.example", "$f/src")

Remove-Item "portail-msap.zip"
Write-Host ""
Write-Host "Envoi sur GitHub..." -ForegroundColor Cyan
git push
Write-Host "Termine. Lancez : cd msap-frontend ; npm run dev" -ForegroundColor Cyan
