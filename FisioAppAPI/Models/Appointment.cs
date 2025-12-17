namespace FisioAppAPI.Models;

public class Appointment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FisioterapeutaId { get; set; }
    public Guid PacienteId { get; set; }
    public DateOnly Fecha { get; set; }
    public TimeOnly Hora { get; set; }
    public string? Descripcion { get; set; }
    public AppointmentType Tipo { get; set; }
    
    // Estados duales (nuevos)
    public AppointmentStatusFisio EstadoFisio { get; set; } = AppointmentStatusFisio.Pendiente;
    public AppointmentStatusPaciente EstadoPaciente { get; set; } = AppointmentStatusPaciente.Pendiente;
    
    // Estado anterior (mantener para backward compatibility)
    public AppointmentStatus Estado { get; set; } = AppointmentStatus.Pendiente;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public enum AppointmentType
{
    EvaluacionInicial,
    Seguimiento,
    ControlMensual,
    Rehabilitacion,
    TerapiaManual,
    Electroterapia
}

public enum AppointmentStatusFisio
{
    Pendiente = 0,
    ConfirmadoFisio = 1,
    Cobrado = 2,
    CanceladaFisio = 3,
    CobroPendiente = 4
}

public enum AppointmentStatusPaciente
{
    Pendiente = 0,
    ConfirmadoPaciente = 1,
    CanceladaPaciente = 2
}

public enum AppointmentStatus
{
    Pendiente,
    Confirmada,
    Cobrada,
    CanceladaFisio,
    CanceladaPaciente
}
