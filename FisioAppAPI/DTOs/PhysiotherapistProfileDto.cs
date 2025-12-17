namespace FisioAppAPI.DTOs;

public class PhysiotherapistProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string LicenseNumber { get; set; } = null!;
    public string LicenseAuthority { get; set; } = null!;
    public string Specialties { get; set; } = null!; // JSON: "Traumatología|Deportiva|Neurológica"
    public int GraduationYear { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
