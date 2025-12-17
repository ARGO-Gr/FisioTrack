namespace FisioAppAPI.DTOs;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid AppointmentId { get; set; }
    public Guid FisioterapeutaId { get; set; }
    public Guid PacienteId { get; set; }
    
    public decimal Monto { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    
    public decimal? MontoPagado { get; set; }
    public decimal? Cambio { get; set; }
    
    public string? NumeroTarjeta { get; set; }
    public string? TitularTarjeta { get; set; }
    public string? NumeroAutorizacion { get; set; }
    
    public string? Notas { get; set; }
    public DateTime FechaPago { get; set; }
    
    public bool IsPendingPayment { get; set; }
    
    public string? NombrePaciente { get; set; }
    public string? EmailPaciente { get; set; }
    public string FechaCita { get; set; } = string.Empty;
    public string HoraCita { get; set; } = string.Empty;
    public string? DescripcionCita { get; set; }
}
