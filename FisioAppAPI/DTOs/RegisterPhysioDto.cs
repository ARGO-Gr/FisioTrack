namespace FisioAppAPI.DTOs;

public class RegisterPhysioDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? Telefono { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public string LicenseNumber { get; set; } = null!;
    public string LicenseAuthority { get; set; } = null!;
    public int GraduationYear { get; set; }
    public List<string> Specialties { get; set; } = new();
}
