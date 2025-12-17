using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FisioAppAPI.Data;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;

namespace FisioAppAPI.Repositories
{
    public class ProgramaRepository : IProgramaRepository
    {
        private readonly ApplicationDbContext _context;

        public ProgramaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProgramaRehabilitacion?> GetByIdAsync(int id)
        {
            return await _context.ProgramasRehabilitacion
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<ProgramaRehabilitacion?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.ProgramasRehabilitacion
                .Include(p => p.Paciente)
                .Include(p => p.Fisioterapeuta)
                .Include(p => p.Semanas)
                    .ThenInclude(s => s.Dias)
                        .ThenInclude(d => d.Ejercicios)
                .Include(p => p.Semanas)
                    .ThenInclude(s => s.Dias)
                        .ThenInclude(d => d.Progresos)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<ProgramaRehabilitacion>> GetByPacienteIdAsync(Guid pacienteId)
        {
            return await _context.ProgramasRehabilitacion
                .Include(p => p.Fisioterapeuta)
                .Include(p => p.Semanas)
                    .ThenInclude(s => s.Dias)
                .Where(p => p.PacienteId == pacienteId)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        public async Task<List<ProgramaRehabilitacion>> GetByFisioterapeutaIdAsync(Guid fisioterapeutaId)
        {
            return await _context.ProgramasRehabilitacion
                .Include(p => p.Paciente)
                .Include(p => p.Semanas)
                    .ThenInclude(s => s.Dias)
                .Where(p => p.FisioterapeutaId == fisioterapeutaId)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        public async Task<ProgramaRehabilitacion?> GetActivoByPacienteIdAsync(Guid pacienteId)
        {
            return await _context.ProgramasRehabilitacion
                .Include(p => p.Fisioterapeuta)
                .Include(p => p.Semanas)
                    .ThenInclude(s => s.Dias)
                        .ThenInclude(d => d.Ejercicios)
                .Include(p => p.Semanas)
                    .ThenInclude(s => s.Dias)
                        .ThenInclude(d => d.Progresos)
                .FirstOrDefaultAsync(p => p.PacienteId == pacienteId && p.Activo);
        }

        public async Task<ProgramaRehabilitacion> CreateAsync(ProgramaRehabilitacion programa)
        {
            _context.ProgramasRehabilitacion.Add(programa);
            await _context.SaveChangesAsync();
            return programa;
        }

        public async Task<bool> UpdateAsync(ProgramaRehabilitacion programa)
        {
            _context.ProgramasRehabilitacion.Update(programa);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var programa = await GetByIdAsync(id);
            if (programa == null) return false;

            _context.ProgramasRehabilitacion.Remove(programa);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ProgramasRehabilitacion.AnyAsync(p => p.Id == id);
        }
    }
}
