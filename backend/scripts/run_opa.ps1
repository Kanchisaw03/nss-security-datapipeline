Param(
    [string]$OpaBin = "opa"
)

$PolicyDir = "backend/app/policy"
& $OpaBin run --server --addr :8181 $PolicyDir


