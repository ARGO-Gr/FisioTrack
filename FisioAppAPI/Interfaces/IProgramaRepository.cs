using System.Collections.Generic;
using System.Threading.Tasks;
using FisioAppAPI.Models;

namespace FisioAppAPI.Interfaces
{
    public interface IProgramaRepository
    {
        Task<ProgramaRehabilitacion?> GetByIdAsync(int id);
        Task<ProgramaRehabilitacion?> GetByIdWithDetailsAsync(int id);
        Task<List<ProgramaRehabilitacion>> GetByPacienteIdAsync(Guid pacienteId);
        Task<List<ProgramaRehabilitacion>> GetByFisioterapeutaIdAsync(Guid fisioterapeutaId);
        Task<ProgramaRehabilitacion?> GetActivoByPacienteIdAsync(Guid pacienteId);
        Task<ProgramaRehabilitacion> CreateAsync(ProgramaRehabilitacion programa);
        Task<bool> UpdateAsync(ProgramaRehabilitacion programa);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
