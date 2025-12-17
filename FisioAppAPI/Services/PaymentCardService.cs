using FisioAppAPI.Data;
using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FisioAppAPI.Services;

public class PaymentCardService : IPaymentCardService
{
    private readonly ApplicationDbContext _context;

    public PaymentCardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PaymentCardDto>> GetUserPaymentCardsAsync(Guid pacienteId)
    {
        var cards = await _context.PaymentCards
            .Where(pc => pc.PacienteId == pacienteId && pc.IsActive)
            .OrderByDescending(pc => pc.IsDefault)
            .ThenByDescending(pc => pc.CreatedAt)
            .ToListAsync();

        return cards.Select(MapToDto).ToList();
    }

    public async Task<PaymentCardDto> AddPaymentCardAsync(Guid pacienteId, CreatePaymentCardDto dto)
    {
        // Detectar tipo de tarjeta
        var cardType = DetectCardType(dto.CardNumber);

        // Obtener últimos 4 dígitos
        var last4 = dto.CardNumber.Substring(dto.CardNumber.Length - 4);

        // Si es la primera tarjeta, hacer que sea predeterminada
        var existingCards = await _context.PaymentCards
            .Where(pc => pc.PacienteId == pacienteId && pc.IsActive)
            .CountAsync();

        var isDefault = existingCards == 0;

        var card = new PaymentCard
        {
            Id = Guid.NewGuid(),
            PacienteId = pacienteId,
            CardNumberEncrypted = EncryptCardNumber(dto.CardNumber),
            Last4 = last4,
            CardHolderName = dto.CardHolderName,
            ExpiryMonth = dto.ExpiryMonth,
            ExpiryYear = dto.ExpiryYear,
            CardType = cardType,
            IsDefault = isDefault,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.PaymentCards.Add(card);
        await _context.SaveChangesAsync();

        return MapToDto(card);
    }

    public async Task<PaymentCardDto> SetDefaultPaymentCardAsync(Guid pacienteId, Guid cardId)
    {
        // Remover default de todas las tarjetas del usuario
        var cards = await _context.PaymentCards
            .Where(pc => pc.PacienteId == pacienteId && pc.IsActive)
            .ToListAsync();

        foreach (var card in cards)
        {
            card.IsDefault = card.Id == cardId;
            card.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var updatedCard = cards.FirstOrDefault(c => c.Id == cardId)
            ?? throw new Exception("Card not found");

        return MapToDto(updatedCard);
    }

    public async Task DeletePaymentCardAsync(Guid cardId)
    {
        var card = await _context.PaymentCards.FindAsync(cardId)
            ?? throw new Exception("Card not found");

        card.IsActive = false;
        card.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    private PaymentCardDto MapToDto(PaymentCard card)
    {
        return new PaymentCardDto
        {
            Id = card.Id,
            Last4 = card.Last4,
            CardHolderName = card.CardHolderName,
            ExpiryMonth = card.ExpiryMonth,
            ExpiryYear = card.ExpiryYear,
            CardType = card.CardType.ToString(),
            IsDefault = card.IsDefault
        };
    }

    private CardType DetectCardType(string cardNumber)
    {
        var firstDigit = cardNumber[0];
        return firstDigit switch
        {
            '4' => CardType.Visa,
            '5' => CardType.Mastercard,
            '3' => CardType.Amex,
            '6' => CardType.Discover,
            _ => CardType.Visa
        };
    }

    private string EncryptCardNumber(string cardNumber)
    {
        // TODO: Implementar encriptación real. Por ahora solo hacer base64
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(cardNumber));
    }
}
