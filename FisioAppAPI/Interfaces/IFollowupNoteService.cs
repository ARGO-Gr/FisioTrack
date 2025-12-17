using FisioAppAPI.Models;

namespace FisioAppAPI.Interfaces;

public interface IFollowupNoteService
{
    Task<FollowupNote?> GetByAppointmentIdAsync(Guid appointmentId);
    Task<FollowupNote?> GetByIdAsync(Guid id);
    Task<FollowupNote> CreateAsync(CreateFollowupNoteDto dto);
    Task<FollowupNote> UpdateAsync(Guid id, UpdateFollowupNoteDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<List<FollowupNote>> GetByPatientIdAsync(Guid patientId);
}

public class CreateFollowupNoteDto
{
    public Guid AppointmentId { get; set; }
    public string Contenido { get; set; } = string.Empty;
}

public class UpdateFollowupNoteDto
{
    public string Contenido { get; set; } = string.Empty;
}
