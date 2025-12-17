# PRODUCCION BD AZURE #

$env:ASPNETCORE_ENVIRONMENT = "Production" 
dotnet ef database update           % aplicar migracion

dotnet ef database drop --force     % limpiar bd


"Server=GERA;Database=FisioApp;Trusted_Connection=True;Encrypt=False;"

"Server=tcp:fisiotrack-server.database.windows.net,1433;Initial Catalog=FisioTrackDB;Persist Security Info=False;User ID=sqladmin;Password=0m4r.g3r4rd0.ru1z;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"