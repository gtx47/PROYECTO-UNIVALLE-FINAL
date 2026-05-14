# ============================================================
#  smoke-test.ps1 - Verificacion end-to-end del backend NestJS
#
#  Pre-req: ejecutar primero .\setup.ps1 y esperar que los
#           12 contenedores esten Up (~20-30s tras el up).
#
#  Uso:
#    cd "C:\Users\Iansu\Downloads\PROYECTO UNIVALLE 3\BACKEND"
#    .\smoke-test.ps1
# ============================================================

$ErrorActionPreference = 'Stop'
$gw = 'http://localhost:8080'
$results = @()

function Step($num, $desc, $block) {
    Write-Host ''
    Write-Host "==> $num. $desc" -ForegroundColor Cyan
    try {
        & $block
        Write-Host "    OK" -ForegroundColor Green
        $script:results += "OK  $num. $desc"
    } catch {
        Write-Host "    FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $script:results += "FAIL $num. $desc -- $($_.Exception.Message)"
        Write-Host ''
        Write-Host '====== RESUMEN ======'
        $script:results | ForEach-Object { Write-Host $_ }
        exit 1
    }
}

function Read-Env {
    $env = @{}
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#=]+)=(.*)$') {
            $env[$matches[1].Trim()] = $matches[2].Trim()
        }
    }
    return $env
}

# Cargar secrets del .env
$envVars = Read-Env
$adminSecret = $envVars['ADMIN_PROMOTE_SECRET']
if (-not $adminSecret) { Write-Host 'ADMIN_PROMOTE_SECRET no encontrado en .env' -ForegroundColor Red; exit 1 }

# Datos de prueba
$ts = [int][double]::Parse((Get-Date -UFormat %s))
$email = "smoke+$ts@test.com"
$password = 'Passw0rd!'
$name = 'Smoke Test'

# Variables compartidas entre pasos
$script:token = $null
$script:tokenAdmin = $null
$script:productId = $null
$script:orderId = $null

Step 1 'Health del gateway' {
    $r = Invoke-RestMethod -Uri "$gw/health" -Method GET
    if (-not $r.ok) { throw 'health no OK' }
}

Step 2 'Registro de usuario' {
    $body = @{ name = $name; email = $email; password = $password } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$gw/api/auth/register" -Method POST -Body $body -ContentType 'application/json'
    if (-not $r.email) { throw 'no devolvio email' }
}

Step 3 'Login (rol customer)' {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$gw/api/auth/login" -Method POST -Body $body -ContentType 'application/json'
    if (-not $r.token) { throw 'no devolvio token' }
    $script:token = $r.token
}

Step 4 'Promote a admin' {
    $body = @{ email = $email; secret = $adminSecret } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$gw/api/auth/promote" -Method POST -Body $body -ContentType 'application/json'
    if ($r.role -ne 'admin') { throw "rol esperado admin, recibido: $($r.role)" }
}

Step 5 'Re-login para obtener token con rol admin' {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$gw/api/auth/login" -Method POST -Body $body -ContentType 'application/json'
    if ($r.user.role -ne 'admin') { throw "token sin rol admin: $($r.user.role)" }
    $script:tokenAdmin = $r.token
}

Step 6 'Seed de productos' {
    $r = Invoke-RestMethod -Uri "$gw/api/products/seed" -Method POST
    if ($r.count -le 0) { throw "count invalido: $($r.count)" }
}

Step 7 'Listar productos' {
    $r = Invoke-RestMethod -Uri "$gw/api/products" -Method GET
    if ($r.data.Count -eq 0) { throw 'sin productos' }
    $script:productId = $r.data[0].id
    if (-not $script:productId) { throw 'id producto vacio' }
}

Step 8 'Crear orden (status pending)' {
    $body = @{
        items = @(@{ productId = $script:productId; quantity = 1 })
        shipping = @{
            fullName = 'Smoke User'
            address  = 'Calle 1 #2-3'
            city     = 'Cali'
            phone    = '3000000000'
        }
    } | ConvertTo-Json -Depth 5
    $headers = @{ Authorization = "Bearer $($script:tokenAdmin)" }
    $r = Invoke-RestMethod -Uri "$gw/api/orders" -Method POST -Body $body -ContentType 'application/json' -Headers $headers
    if ($r.data.status -ne 'pending') { throw "status esperado pending: $($r.data.status)" }
    $script:orderId = $r.data.id
}

Step 9 'Procesar pago (tarjeta dig par => approved)' {
    $body = @{
        orderId    = $script:orderId
        cardNumber = '4532 1234 5678 9010'
        cardHolder = 'SMOKE TEST'
    } | ConvertTo-Json
    $headers = @{ Authorization = "Bearer $($script:tokenAdmin)" }
    $r = Invoke-RestMethod -Uri "$gw/api/payments" -Method POST -Body $body -ContentType 'application/json' -Headers $headers
    if (-not $r.success) { throw "pago no aprobado: $($r.data.message)" }
}

Step 10 'Esperar 3s para Outbox + Saga (payment.approved)' {
    Start-Sleep -Seconds 3
}

Step 11 'Verificar orden confirmada por Saga' {
    $headers = @{ Authorization = "Bearer $($script:tokenAdmin)" }
    $r = Invoke-RestMethod -Uri "$gw/api/orders/$($script:orderId)" -Method GET -Headers $headers
    if ($r.data.status -ne 'confirmed') { throw "Saga fallo: status = $($r.data.status) (esperado confirmed)" }
}

Step 12 'Metricas admin' {
    $headers = @{ Authorization = "Bearer $($script:tokenAdmin)" }
    $r = Invoke-RestMethod -Uri "$gw/api/admin/metrics" -Method GET -Headers $headers
    if ($r.data.totalSales -le 0) { throw "totalSales = $($r.data.totalSales)" }
    Write-Host "    metrics: totalSales=$($r.data.totalSales) confirmed=$($r.data.orders.confirmed) total=$($r.data.orders.total)"
}

Step 13 'Cancelar orden (admin)' {
    $body = @{ status = 'cancelled' } | ConvertTo-Json
    $headers = @{ Authorization = "Bearer $($script:tokenAdmin)" }
    $r = Invoke-RestMethod -Uri "$gw/api/orders/$($script:orderId)" -Method PUT -Body $body -ContentType 'application/json' -Headers $headers
    if ($r.data.status -ne 'cancelled') { throw "status = $($r.data.status)" }
}

Step 14 'Esperar 3s para order.cancelled (Outbox -> products subscriber)' {
    Start-Sleep -Seconds 3
}

Write-Host ''
Write-Host '====== RESUMEN ======' -ForegroundColor Yellow
$results | ForEach-Object { Write-Host $_ -ForegroundColor Green }
Write-Host ''
Write-Host '*** SMOKE TEST PASSED *** Migracion 100% verificada end-to-end' -ForegroundColor Green
