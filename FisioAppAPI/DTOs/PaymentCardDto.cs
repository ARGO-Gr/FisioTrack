namespace FisioAppAPI.DTOs;

public class PaymentCardDto
{
    public Guid Id { get; set; }
    public string Last4 { get; set; } = null!;
    public string CardHolderName { get; set; } = null!;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public string CardType { get; set; } = null!; // "Visa", "Mastercard", etc.
    public bool IsDefault { get; set; }
}

public class CreatePaymentCardDto
{
    public string CardNumber { get; set; } = null!;
    public string CardHolderName { get; set; } = null!;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
}

public class UpdatePaymentCardDto
{
    public Guid Id { get; set; }
    public bool IsDefault { get; set; }
}
