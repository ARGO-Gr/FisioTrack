namespace FisioAppAPI.DTOs;

public class RegisterDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? FullName { get; set; }
    public string? Telefono { get; set; }
    public DateTime? FechaNacimiento { get; set; }
}
