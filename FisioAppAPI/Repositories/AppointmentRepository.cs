using FisioAppAPI.Data;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FisioAppAPI.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly ApplicationDbContext _context;

    public AppointmentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Appointment?> GetByIdAsync(Guid id)
    {
        return await _context.Appointments.FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<List<Appointment>> GetByFisioterapeutaIdAsync(Guid fisioterapeutaId, DateOnly? fecha = null)
    {
        var query = _context.Appointments
            .Where(a => a.FisioterapeutaId == fisioterapeutaId);

        if (fecha.HasValue)
        {
            query = query.Where(a => a.Fecha == fecha.Value);
        }

        return await query.OrderBy(a => a.Fecha).ThenBy(a => a.Hora).ToListAsync();
    }

    public async Task<List<Appointment>> GetByFisioterapeutaIdAndDateRangeAsync(Guid fisioterapeutaId, DateOnly fechaInicio, DateOnly fechaFin)
    {
        return await _context.Appointments
            .Where(a => a.FisioterapeutaId == fisioterapeutaId && 
                        a.Fecha >= fechaInicio && 
                        a.Fecha <= fechaFin)
            .OrderBy(a => a.Fecha)
            .ThenBy(a => a.Hora)
            .ToListAsync();
    }

    public async Task<List<Appointment>> GetByPacienteIdAsync(Guid pacienteId)
    {
        return await _context.Appointments
            .Where(a => a.PacienteId == pacienteId)
            .OrderBy(a => a.Fecha)
            .ThenBy(a => a.Hora)
            .ToListAsync();
    }

    public async Task<List<Appointment>> GetConflictingAppointmentsAsync(Guid fisioterapeutaId, DateOnly fecha, TimeOnly hora, Guid? excludeAppointmentId = null)
    {
        var query = _context.Appointments
            .Where(a => a.FisioterapeutaId == fisioterapeutaId 
                && a.Fecha == fecha 
                && a.Hora == hora
                && a.Estado != AppointmentStatus.CanceladaFisio
                && a.Estado != AppointmentStatus.CanceladaPaciente);

        if (excludeAppointmentId.HasValue)
        {
            query = query.Where(a => a.Id != excludeAppointmentId.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<Appointment> CreateAsync(Appointment appointment)
    {
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task<Appointment> UpdateAsync(Appointment appointment)
    {
        appointment.UpdatedAt = DateTime.UtcNow;
        _context.Appointments.Update(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var appointment = await GetByIdAsync(id);
        if (appointment == null)
            return false;

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
