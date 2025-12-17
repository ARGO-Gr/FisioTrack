using System.Collections.Generic;
using System.Threading.Tasks;
using FisioAppAPI.DTOs;

namespace FisioAppAPI.Interfaces
{
    public interface IProgramaService
    {
        Task<ProgramaDetalleDto?> CrearProgramaAsync(Guid fisioterapeutaId, CrearProgramaDto dto);
        Task<ProgramaDetalleDto?> ActualizarProgramaAsync(int programaId, Guid fisioterapeutaId, CrearProgramaDto dto);
        Task<ProgramaDetalleDto?> GetProgramaDetalleAsync(int programaId, Guid userId);
        Task<List<ProgramaDetalleDto>> GetProgramasByPacienteAsync(Guid pacienteId);
        Task<List<ProgramaDetalleDto>> GetProgramasByFisioterapeutaAsync(Guid fisioterapeutaId);
        Task<ProgramaDetalleDto?> GetProgramaActivoByPacienteAsync(Guid pacienteId);
        Task<bool> MarcarDiaCompletadoAsync(Guid pacienteId, MarcarDiaCompletadoDto dto);
        Task<bool> MarcarEjercicioCompletadoAsync(Guid pacienteId, MarcarEjercicioCompletadoDto dto);
        Task<ProgresoGeneralDto?> GetProgresoGeneralAsync(int programaId);
        Task<bool> EliminarProgramaAsync(int programaId, Guid fisioterapeutaId);
        Task<List<IncumplimientoDto>> GetIncumplimientosPorPacienteAsync(Guid pacienteId, int programaId);
        Task VerificarYMarcarIncumplimientosAsync();
    }
}
