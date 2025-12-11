using FisioAppAPI.Models;

namespace FisioAppAPI.DTOs;

public class AppointmentDto
{
    public Guid Id { get; set; }
    public Guid FisioterapeutaId { get; set; }
    public Guid PacienteId { get; set; }
    public string? NombrePaciente { get; set; }
    public string? EmailPaciente { get; set; }
    public string? TelefonoPaciente { get; set; }
    public string Fecha { get; set; } = string.Empty; // YYYY-MM-DD
    public string Hora { get; set; } = string.Empty;  // HH:mm
    public string? Descripcion { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string EstadoFisio { get; set; } = string.Empty;
    public string EstadoPaciente { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty; // Backward compatibility
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateAppointmentDto
{
    public Guid PacienteId { get; set; }
    public Guid FisioterapeutaId { get; set; }
    public string Fecha { get; set; } = string.Empty; // YYYY-MM-DD
    public string Hora { get; set; } = string.Empty;  // HH:mm
    public string? Descripcion { get; set; }
    public string Tipo { get; set; } = string.Empty;
}

public class UpdateAppointmentDto
{
    public Guid PacienteId { get; set; }
    public string Fecha { get; set; } = string.Empty; // YYYY-MM-DD
    public string Hora { get; set; } = string.Empty;  // HH:mm
    public string? Descripcion { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
}
