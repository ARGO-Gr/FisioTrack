# PRODUCCION BD AZURE #

$env:ASPNETCORE_ENVIRONMENT = "Production" 
dotnet ef database update           % aplicar migracion

dotnet ef database drop --force     % limpiar bd