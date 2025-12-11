namespace FisioAppAPI.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? FullName { get; set; }
    public string? Telefono { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public bool IsConfirmed { get; set; } = false;
    public string? ConfirmationToken { get; set; }
    public DateTime? ConfirmationTokenExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsLocked { get; set; } = false;
    public string? UnlockCode { get; set; }
    public DateTime? UnlockCodeExpiresAt { get; set; }
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LastFailedLoginAttempt { get; set; }
}
