using FisioAppAPI.Models;

namespace FisioAppAPI.Interfaces;

public interface IAppointmentRepository
{
    Task<Appointment?> GetByIdAsync(Guid id);
    Task<List<Appointment>> GetByFisioterapeutaIdAsync(Guid fisioterapeutaId, DateOnly? fecha = null);
    Task<List<Appointment>> GetByFisioterapeutaIdAndDateRangeAsync(Guid fisioterapeutaId, DateOnly fechaInicio, DateOnly fechaFin);
    Task<List<Appointment>> GetByPacienteIdAsync(Guid pacienteId);
    Task<List<Appointment>> GetConflictingAppointmentsAsync(Guid fisioterapeutaId, DateOnly fecha, TimeOnly hora, Guid? excludeAppointmentId = null);
    Task<Appointment> CreateAsync(Appointment appointment);
    Task<Appointment> UpdateAsync(Appointment appointment);
    Task<bool> DeleteAsync(Guid id);
    Task SaveChangesAsync();
}
