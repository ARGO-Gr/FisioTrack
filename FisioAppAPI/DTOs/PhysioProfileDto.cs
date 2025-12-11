namespace FisioAppAPI.DTOs;

public class PhysioProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string LicenseNumber { get; set; } = null!;
    public string LicenseAuthority { get; set; } = null!;
    public List<string> Specialties { get; set; } = new();
    public int GraduationYear { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
