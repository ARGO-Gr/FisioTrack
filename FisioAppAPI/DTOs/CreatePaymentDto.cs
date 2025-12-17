using System.ComponentModel.DataAnnotations;

namespace FisioAppAPI.DTOs;

public class CreatePaymentDto
{
    [Required]
    public Guid AppointmentId { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
    public decimal Monto { get; set; }
    
    [Required]
    public string MetodoPago { get; set; } = string.Empty; // "Efectivo" o "Tarjeta"
    
    // Campos para pago en efectivo
    public decimal? MontoPagado { get; set; }
    public decimal? Cambio { get; set; }
    
    // Campos para pago con tarjeta
    public string? NumeroTarjeta { get; set; } // Solo últimos 4 dígitos
    public string? TitularTarjeta { get; set; }
    public string? NumeroAutorizacion { get; set; }
    
    public string? Notas { get; set; }
}
