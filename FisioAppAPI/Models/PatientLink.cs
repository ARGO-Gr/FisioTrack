namespace FisioAppAPI.Models;

public class PatientLink
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FisioterapeutaId { get; set; }
    public Guid PacienteId { get; set; }
    public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;
    public DateTime? FechaAlta { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
