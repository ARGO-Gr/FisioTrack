using FisioAppAPI.Data;
using FisioAppAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FisioAppAPI.Repositories;

public class FollowupNoteRepository
{
    private readonly ApplicationDbContext _context;

    public FollowupNoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FollowupNote?> GetByAppointmentIdAsync(Guid appointmentId)
    {
        return await _context.FollowupNotes
            .FirstOrDefaultAsync(fn => fn.AppointmentId == appointmentId);
    }

    public async Task<FollowupNote?> GetByIdAsync(Guid id)
    {
        return await _context.FollowupNotes.FindAsync(id);
    }

    public async Task<FollowupNote> CreateAsync(FollowupNote note)
    {
        _context.FollowupNotes.Add(note);
        await _context.SaveChangesAsync();
        return note;
    }

    public async Task<FollowupNote> UpdateAsync(FollowupNote note)
    {
        note.UpdatedAt = DateTime.UtcNow;
        _context.FollowupNotes.Update(note);
        await _context.SaveChangesAsync();
        return note;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var note = await GetByIdAsync(id);
        if (note == null)
            return false;

        _context.FollowupNotes.Remove(note);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<FollowupNote>> GetByPatientIdAsync(Guid patientId)
    {
        return await _context.FollowupNotes
            .Where(fn => _context.Appointments
                .Where(a => a.PacienteId == patientId)
                .Select(a => a.Id)
                .Contains(fn.AppointmentId))
            .ToListAsync();
    }
}
