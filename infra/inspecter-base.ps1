param([string]$Texte = "budget")
Set-Location $PSScriptRoot

Write-Host "Derniers événements stockés par le serveur :" -ForegroundColor Cyan
docker compose exec -T db psql -U synapse -d synapse -c "SELECT e.type, left(ej.json, 120) AS contenu FROM events e JOIN event_json ej USING (event_id) ORDER BY e.stream_ordering DESC LIMIT 5;"

Write-Host "Recherche du texte en clair « $Texte » dans toute la base :" -ForegroundColor Cyan
docker compose exec -T db psql -U synapse -d synapse -c "SELECT count(*) AS occurrences_en_clair FROM event_json WHERE json LIKE '%$Texte%';"
