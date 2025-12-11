namespace FisioAppAPI.DTOs;

public class PhysioListItemDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public DateTime? FechaNacimiento { get; set; }
    public List<string> Specialties { get; set; } = new();
    public bool IsActive { get; set; }
    public string LicenseNumber { get; set; } = null!;
}
