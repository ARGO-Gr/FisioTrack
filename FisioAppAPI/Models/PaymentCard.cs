namespace FisioAppAPI.Models;

public class PaymentCard
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PacienteId { get; set; }
    
    // Información de la tarjeta
    public string CardNumberEncrypted { get; set; } = null!; // Almacenar encriptado
    public string Last4 { get; set; } = null!; // Últimos 4 dígitos para mostrar
    public string CardHolderName { get; set; } = null!;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public CardType CardType { get; set; } // Visa, Mastercard, Amex, etc.
    
    // Control
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum CardType
{
    Visa = 0,
    Mastercard = 1,
    Amex = 2,
    Discover = 3
}
