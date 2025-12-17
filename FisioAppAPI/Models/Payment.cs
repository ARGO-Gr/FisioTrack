namespace FisioAppAPI.Models;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AppointmentId { get; set; }
    public Guid FisioterapeutaId { get; set; }
    public Guid PacienteId { get; set; }
    
    public decimal Monto { get; set; }
    public PaymentMethod MetodoPago { get; set; }
    
    // Campos para pago en efectivo
    public decimal? MontoPagado { get; set; }
    public decimal? Cambio { get; set; }
    
    // Campos para pago con tarjeta
    public string? NumeroTarjeta { get; set; } // Solo últimos 4 dígitos
    public string? TitularTarjeta { get; set; }
    public string? NumeroAutorizacion { get; set; }
    
    public string? Notas { get; set; }
    public DateTime FechaPago { get; set; } = DateTime.UtcNow;
    
    // Campo para pagos pendientes (tarjeta)
    public bool IsPendingPayment { get; set; } = false;
    
    // Información de la cita (desnormalizada para historial)
    public string? NombrePaciente { get; set; }
    public string? EmailPaciente { get; set; }
    public DateOnly FechaCita { get; set; }
    public TimeOnly HoraCita { get; set; }
    public string? DescripcionCita { get; set; }
}

public enum PaymentMethod
{
    Efectivo = 0,
    Tarjeta = 1
}
