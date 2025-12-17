namespace FisioAppAPI.DTOs;

public class ConfirmPaymentDto
{
    public string NumeroTarjeta { get; set; } = string.Empty; // Últimos 4 dígitos
    public string TitularTarjeta { get; set; } = string.Empty;
    public string NumeroAutorizacion { get; set; } = string.Empty; // CVV o código de autorización
}
