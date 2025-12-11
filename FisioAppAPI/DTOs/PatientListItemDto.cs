namespace FisioAppAPI.DTOs;

public class PatientListItemDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime? FechaNacimiento { get; set; }
}
