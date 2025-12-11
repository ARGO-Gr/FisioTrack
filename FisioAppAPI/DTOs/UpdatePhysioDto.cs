namespace FisioAppAPI.DTOs;

public class UpdatePhysioDto
{
    public string? FullName { get; set; }
    public List<string>? Specialties { get; set; }
    public string? Bio { get; set; }
    public string? Phone { get; set; }
}
