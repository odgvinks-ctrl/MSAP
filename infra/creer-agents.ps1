$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$agents = @("aminata.ouedraogo", "hamidou.diallo", "issouf.sawadogo")

foreach ($agent in $agents) {
  docker compose exec -T synapse register_new_matrix_user -c /data/secrets.yaml -u $agent -p msap2026 --no-admin http://localhost:8008
}

Write-Host ""
Write-Host "Agents fictifs créés (mot de passe : Msap2026) :" -ForegroundColor Green
$agents | ForEach-Object { Write-Host "  @$($_):msap.local" }
Write-Host "Element : http://localhost:8080" -ForegroundColor Cyan
