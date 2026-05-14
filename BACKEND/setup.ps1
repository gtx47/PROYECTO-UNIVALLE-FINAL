# ============================================================
#  setup.ps1 - Levanta el stack NestJS completo en local (Windows)
#
#  Uso:
#    cd "C:\Users\Iansu\Downloads\PROYECTO UNIVALLE 3\BACKEND"
#    .\setup.ps1
# ============================================================

$ErrorActionPreference = 'Stop'

Write-Host '==> 1/4  Verificando red Docker ecommerce-shared-net...'
$network = docker network ls --filter name=ecommerce-shared-net --format '{{.Name}}'
if ($network -ne 'ecommerce-shared-net') {
    Write-Host '       creando red...'
    docker network create ecommerce-shared-net | Out-Null
} else {
    Write-Host '       red ya existe.'
}

Write-Host '==> 2/4  Verificando .env...'
if (-not (Test-Path .env)) {
    Write-Host '       creando .env desde .env.example...'
    Copy-Item .env.example .env
    Write-Host '       IMPORTANTE: edita .env y reemplaza los placeholders con secrets reales (openssl rand -base64 48).'
} else {
    Write-Host '       .env ya existe, lo conservo.'
}

Write-Host '==> 3/4  Construyendo y levantando contenedores (puede tardar la primera vez)...'
docker compose up -d --build

Write-Host '==> 4/4  Listo!'
Write-Host ''
Write-Host '  API Gateway        http://localhost:8080'
Write-Host '  RabbitMQ Mgmt      http://localhost:15672  (guest / guest)'
Write-Host ''
Write-Host '  Servicios:'
Write-Host '    auth-service     http://localhost:3001'
Write-Host '    users-service    http://localhost:3002'
Write-Host '    products-service http://localhost:3003'
Write-Host '    orders-service   http://localhost:3004'
Write-Host '    payments-service http://localhost:3005'
Write-Host ''
Write-Host '  Logs:    docker compose logs -f'
Write-Host '  Detener: docker compose down'
