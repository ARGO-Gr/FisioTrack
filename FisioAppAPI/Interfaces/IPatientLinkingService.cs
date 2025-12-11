using FisioAppAPI.DTOs;

namespace FisioAppAPI.Interfaces;

public interface IPatientLinkingService
{
    Task<LinkedPatientDto> LinkPatientAsync(Guid fisioterapeutaId, string pacienteId);
    Task<List<LinkedPatientDto>> GetLinkedPatientsAsync(Guid fisioterapeutaId);
    Task<bool> UnlinkPatientAsync(Guid fisioterapeutaId, string pacienteId);
}
