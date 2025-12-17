-- Script para simular un incumplimiento
-- Actualiza un día específico como incumplido

-- Ver los días disponibles
SELECT TOP 5 
    dr.Id, 
    dr.NombreDia, 
    dr.Completado, 
    dr.Incumplido,
    sr.NumeroSemana,
    pr.Nombre as ProgramaNombre
FROM DiaRutina dr
INNER JOIN SemanaRutina sr ON dr.SemanaId = sr.Id
INNER JOIN ProgramasRehabilitacion pr ON sr.ProgramaId = pr.Id
WHERE pr.Activo = 1 AND dr.Tipo = 0 -- 0 = Rutina
ORDER BY sr.NumeroSemana, dr.OrdenDia;

-- Marcar un día como incumplido (reemplaza el ID según lo que veas arriba)
-- UPDATE DiaRutina 
-- SET Incumplido = 1, 
--     FechaIncumplimiento = GETDATE()
-- WHERE Id = [ID_DEL_DIA_QUE_QUIERAS_MARCAR];

-- Ejemplo: Si el Id es 5
-- UPDATE DiaRutina SET Incumplido = 1, FechaIncumplimiento = GETDATE() WHERE Id = 5;
