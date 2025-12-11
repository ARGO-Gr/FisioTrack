using FisioAppAPI.DTOs;

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
}
