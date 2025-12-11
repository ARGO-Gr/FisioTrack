using FisioAppAPI.DTOs;
using FisioAppAPI.Models;

namespace FisioAppAPI.Interfaces;

public interface IAppointmentService
{
    Task<AppointmentDto?> GetAppointmentAsync(Guid id);
    Task<List<AppointmentDto>> GetFisioterapeutaAppointmentsAsync(Guid fisioterapeutaId, string? fecha = null);
    Task<List<AppointmentDto>> GetFisioterapeutaAppointmentsByDateRangeAsync(Guid fisioterapeutaId, string fechaInicio, string fechaFin);
    Task<List<AppointmentDto>> GetPatientAppointmentsAsync(Guid pacienteId);
    Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto);
    Task<AppointmentDto> UpdateAppointmentAsync(Guid id, UpdateAppointmentDto dto);
    Task<bool> DeleteAppointmentAsync(Guid id);
    Task<AppointmentDto> ChangeAppointmentStatusAsync(Guid id, string newStatus);
    Task<AppointmentDto> ChangeAppointmentStatusFisioAsync(Guid id, string newStatusFisio);
    Task<AppointmentDto> ChangeAppointmentStatusPacienteAsync(Guid id, string newStatusPaciente);
    Task<List<PatientListItemDto>> GetPacientesAsync(Guid fisioterapeutaId, string? search = null);
    Task<List<PatientListItemDto>> SearchAllPatientsAsync(string? search = null);
}
