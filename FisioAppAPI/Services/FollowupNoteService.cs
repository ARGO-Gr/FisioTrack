using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;
using FisioAppAPI.Repositories;

namespace FisioAppAPI.Services;

public class FollowupNoteService : IFollowupNoteService
{
    private readonly FollowupNoteRepository _repository;

    public FollowupNoteService(FollowupNoteRepository repository)
    {
        _repository = repository;
    }

    public async Task<FollowupNote?> GetByAppointmentIdAsync(Guid appointmentId)
    {
        return await _repository.GetByAppointmentIdAsync(appointmentId);
    }

    public async Task<FollowupNote?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<FollowupNote> CreateAsync(CreateFollowupNoteDto dto)
    {
        var note = new FollowupNote
        {
            AppointmentId = dto.AppointmentId,
            Contenido = dto.Contenido,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return await _repository.CreateAsync(note);
    }

    public async Task<FollowupNote> UpdateAsync(Guid id, UpdateFollowupNoteDto dto)
    {
        var note = await _repository.GetByIdAsync(id);
        if (note == null)
            throw new Exception($"Followup note with ID {id} not found");

        note.Contenido = dto.Contenido;
        note.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(note);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<List<FollowupNote>> GetByPatientIdAsync(Guid patientId)
    {
        return await _repository.GetByPatientIdAsync(patientId);
    }
}
