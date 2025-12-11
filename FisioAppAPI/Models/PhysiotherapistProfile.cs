namespace FisioAppAPI.Models;

public class PhysiotherapistProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string LicenseNumber { get; set; } = null!;
    public string LicenseAuthority { get; set; } = null!;
    public string Specialties { get; set; } = null!; // JSON: "Traumatología|Deportiva|Neurológica"
    public int GraduationYear { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
