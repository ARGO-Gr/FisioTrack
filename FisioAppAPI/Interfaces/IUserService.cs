using FisioAppAPI.DTOs;
using FisioAppAPI.Models;

namespace FisioAppAPI.Interfaces;

public interface IUserService
{
    Task RegisterAsync(RegisterDto dto);
    Task<bool> ConfirmAsync(ConfirmDto dto);
    Task<string> LoginAsync(LoginDto dto);
    Task LockUserAsync(LockUserDto dto);
    Task<bool> UnlockUserAsync(UnlockUserDto dto);
    Task ResendUnlockCodeAsync(ResendUnlockCodeDto dto);
    Task SendPasswordAsync(SendPasswordDto dto);
    Task<User?> GetUserByEmailAsync(string email);
    Task UpdateUserAsync(User user);
    Task<UserProfileDto> GetUserProfileAsync(Guid userId);
    Task<UserProfileDto> UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto dto);
}

public interface IPaymentCardService
{
    Task<List<PaymentCardDto>> GetUserPaymentCardsAsync(Guid pacienteId);
    Task<PaymentCardDto> AddPaymentCardAsync(Guid pacienteId, CreatePaymentCardDto dto);
    Task<PaymentCardDto> SetDefaultPaymentCardAsync(Guid pacienteId, Guid cardId);
    Task DeletePaymentCardAsync(Guid cardId);
}
