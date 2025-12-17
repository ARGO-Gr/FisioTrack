namespace FisioAppAPI.DTOs;

public class LinkedPatientDto
{
    public string Id { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Telefono { get; set; }
    public int? Edad { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public DateTime FechaIngreso { get; set; }
    public int RutinasHistorial { get; set; } = 0;
    public int DiasCompletados { get; set; } = 0;
    public int DiasTotales { get; set; } = 0;
    public double PorcentajeProgreso { get; set; } = 0;
    public bool TieneProgramaActivo { get; set; } = false;
}
