using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FisioAppAPI.Data;
using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;

namespace FisioAppAPI.Services
{
    public class ProgramaService : IProgramaService
    {
        private readonly IProgramaRepository _programaRepository;
        private readonly ApplicationDbContext _context;

        public ProgramaService(IProgramaRepository programaRepository, ApplicationDbContext context)
        {
            _programaRepository = programaRepository;
            _context = context;
        }

        public async Task<ProgramaDetalleDto?> CrearProgramaAsync(Guid fisioterapeutaId, CrearProgramaDto dto)
        {
            // Desactivar programas activos previos del paciente
            var programasActivos = await _context.ProgramasRehabilitacion
                .Where(p => p.PacienteId == dto.PacienteId && p.Activo)
                .ToListAsync();

            foreach (var programa in programasActivos)
            {
                programa.Activo = false;
                programa.FechaActualizacion = DateTime.UtcNow;
            }

            // Calcular fecha fin
            var fechaFin = dto.FechaInicio.AddDays(dto.Semanas * 7);

            // Crear programa
            var nuevoPrograma = new ProgramaRehabilitacion
            {
                PacienteId = dto.PacienteId,
                FisioterapeutaId = fisioterapeutaId,
                Nombre = dto.NombrePrograma,
                Descripcion = dto.Descripcion,
                Diagnostico = dto.Diagnostico,
                FechaInicio = dto.FechaInicio,
                FechaFin = fechaFin,
                TotalSemanas = dto.Semanas,
                SemanaActual = 1,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            // Crear semanas
            foreach (var semanaDto in dto.SemanasRutina)
            {
                var semana = new SemanaRutina
                {
                    NumeroSemana = semanaDto.NumeroSemana,
                    FechaCreacion = DateTime.UtcNow
                };

                // Crear días
                foreach (var diaDto in semanaDto.Dias)
                {
                    var dia = new DiaRutina
                    {
                        NombreDia = diaDto.NombreDia,
                        OrdenDia = diaDto.OrdenDia,
                        Tipo = diaDto.Tipo.ToLower() == "rutina" ? TipoDia.Rutina : TipoDia.Descanso,
                        NombreRutina = diaDto.NombreRutina,
                        Completado = false,
                        FechaCreacion = DateTime.UtcNow
                    };

                    // Crear ejercicios si es día de rutina
                    if (diaDto.Ejercicios != null && diaDto.Ejercicios.Any())
                    {
                        foreach (var ejercicioDto in diaDto.Ejercicios)
                        {
                            var ejercicio = new Ejercicio
                            {
                                Orden = ejercicioDto.Orden,
                                Nombre = ejercicioDto.Nombre,
                                Descripcion = ejercicioDto.Descripcion,
                                Repeticiones = ejercicioDto.Repeticiones,
                                TiempoDescanso = ejercicioDto.TiempoDescanso,
                                InstruccionesJson = JsonSerializer.Serialize(ejercicioDto.Instrucciones),
                                FechaCreacion = DateTime.UtcNow
                            };
                            dia.Ejercicios.Add(ejercicio);
                        }
                    }

                    semana.Dias.Add(dia);
                }

                nuevoPrograma.Semanas.Add(semana);
            }

            var programaCreado = await _programaRepository.CreateAsync(nuevoPrograma);
            
            // Obtener el programa completo con todas las relaciones
            var programaCompleto = await _programaRepository.GetByIdWithDetailsAsync(programaCreado.Id);
            
            return programaCompleto != null ? MapToDetalleDto(programaCompleto) : null;
        }

        public async Task<ProgramaDetalleDto?> ActualizarProgramaAsync(int programaId, Guid fisioterapeutaId, CrearProgramaDto dto)
        {
            // Obtener programa existente
            var programaExistente = await _context.ProgramasRehabilitacion
                .Include(p => p.Semanas)
                    .ThenInclude(s => s.Dias)
                        .ThenInclude(d => d.Ejercicios)
                .FirstOrDefaultAsync(p => p.Id == programaId && p.FisioterapeutaId == fisioterapeutaId);

            if (programaExistente == null)
                return null;

            // Actualizar información básica
            programaExistente.Nombre = dto.NombrePrograma;
            programaExistente.Descripcion = dto.Descripcion;
            programaExistente.Diagnostico = dto.Diagnostico;
            programaExistente.FechaInicio = dto.FechaInicio;
            programaExistente.FechaFin = dto.FechaInicio.AddDays(dto.Semanas * 7);
            programaExistente.TotalSemanas = dto.Semanas;
            programaExistente.FechaActualizacion = DateTime.UtcNow;

            // Eliminar semanas existentes
            _context.SemanasRutina.RemoveRange(programaExistente.Semanas);

            // Limpiar colección
            programaExistente.Semanas.Clear();

            // Crear nuevas semanas
            foreach (var semanaDto in dto.SemanasRutina)
            {
                var semana = new SemanaRutina
                {
                    NumeroSemana = semanaDto.NumeroSemana,
                    FechaCreacion = DateTime.UtcNow
                };

                // Crear días
                foreach (var diaDto in semanaDto.Dias)
                {
                    var dia = new DiaRutina
                    {
                        NombreDia = diaDto.NombreDia,
                        OrdenDia = diaDto.OrdenDia,
                        Tipo = diaDto.Tipo.ToLower() == "rutina" ? TipoDia.Rutina : TipoDia.Descanso,
                        NombreRutina = diaDto.NombreRutina,
                        Completado = false,
                        FechaCreacion = DateTime.UtcNow
                    };

                    // Crear ejercicios si es día de rutina
                    if (diaDto.Ejercicios != null && diaDto.Ejercicios.Any())
                    {
                        foreach (var ejercicioDto in diaDto.Ejercicios)
                        {
                            var ejercicio = new Ejercicio
                            {
                                Orden = ejercicioDto.Orden,
                                Nombre = ejercicioDto.Nombre,
                                Descripcion = ejercicioDto.Descripcion,
                                Repeticiones = ejercicioDto.Repeticiones,
                                TiempoDescanso = ejercicioDto.TiempoDescanso,
                                InstruccionesJson = JsonSerializer.Serialize(ejercicioDto.Instrucciones),
                                FechaCreacion = DateTime.UtcNow
                            };
                            dia.Ejercicios.Add(ejercicio);
                        }
                    }

                    semana.Dias.Add(dia);
                }

                programaExistente.Semanas.Add(semana);
            }

            await _context.SaveChangesAsync();

            // Obtener el programa actualizado con todas las relaciones
            var programaActualizado = await _programaRepository.GetByIdWithDetailsAsync(programaId);
            
            return programaActualizado != null ? MapToDetalleDto(programaActualizado) : null;
        }

        public async Task<ProgramaDetalleDto?> GetProgramaDetalleAsync(int programaId, Guid userId)
        {
            var programa = await _programaRepository.GetByIdWithDetailsAsync(programaId);
            
            if (programa == null) return null;

            // Verificar que el usuario tiene acceso al programa
            if (programa.PacienteId != userId && programa.FisioterapeutaId != userId)
                return null;

            return MapToDetalleDto(programa);
        }

        public async Task<List<ProgramaDetalleDto>> GetProgramasByPacienteAsync(Guid pacienteId)
        {
            var programas = await _programaRepository.GetByPacienteIdAsync(pacienteId);
            return programas.Select(MapToDetalleDto).ToList();
        }

        public async Task<List<ProgramaDetalleDto>> GetProgramasByFisioterapeutaAsync(Guid fisioterapeutaId)
        {
            var programas = await _programaRepository.GetByFisioterapeutaIdAsync(fisioterapeutaId);
            return programas.Select(MapToDetalleDto).ToList();
        }

        public async Task<ProgramaDetalleDto?> GetProgramaActivoByPacienteAsync(Guid pacienteId)
        {
            var programa = await _programaRepository.GetActivoByPacienteIdAsync(pacienteId);
            return programa != null ? MapToDetalleDto(programa) : null;
        }

        public async Task<bool> MarcarDiaCompletadoAsync(Guid pacienteId, MarcarDiaCompletadoDto dto)
        {
            var dia = await _context.DiasRutina
                .Include(d => d.Semana)
                    .ThenInclude(s => s.Programa)
                .FirstOrDefaultAsync(d => d.Id == dto.DiaRutinaId);

            if (dia == null || dia.Semana?.Programa?.PacienteId != pacienteId)
                return false;

            dia.Completado = dto.Completado;
            dia.FechaCompletado = dto.Completado ? DateTime.UtcNow : null;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> MarcarEjercicioCompletadoAsync(Guid pacienteId, MarcarEjercicioCompletadoDto dto)
        {
            var ejercicio = await _context.Ejercicios
                .Include(e => e.DiaRutina)
                    .ThenInclude(d => d.Semana)
                        .ThenInclude(s => s.Programa)
                .FirstOrDefaultAsync(e => e.Id == dto.EjercicioId);

            if (ejercicio == null || ejercicio.DiaRutina?.Semana?.Programa?.PacienteId != pacienteId)
                return false;

            // Buscar o crear progreso del ejercicio
            var progreso = await _context.ProgresoEjercicios
                .FirstOrDefaultAsync(p => 
                    p.EjercicioId == dto.EjercicioId && 
                    p.DiaRutinaId == dto.DiaRutinaId &&
                    p.PacienteId == pacienteId);

            if (progreso == null)
            {
                progreso = new ProgresoEjercicio
                {
                    EjercicioId = dto.EjercicioId,
                    DiaRutinaId = dto.DiaRutinaId,
                    PacienteId = pacienteId,
                    FechaCreacion = DateTime.UtcNow
                };
                _context.ProgresoEjercicios.Add(progreso);
            }

            progreso.Completado = dto.Completado;
            progreso.FechaCompletado = dto.Completado ? DateTime.UtcNow : null;
            progreso.Notas = dto.Notas;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<ProgresoGeneralDto?> GetProgresoGeneralAsync(int programaId)
        {
            var programa = await _programaRepository.GetByIdWithDetailsAsync(programaId);
            
            if (programa == null) return null;

            var diasCompletados = programa.Semanas
                .SelectMany(s => s.Dias)
                .Count(d => d.Completado && d.Tipo == TipoDia.Rutina);

            var diasDescanso = programa.Semanas
                .SelectMany(s => s.Dias)
                .Count(d => d.Tipo == TipoDia.Descanso);

            var diasTotales = programa.Semanas
                .SelectMany(s => s.Dias)
                .Count(d => d.Tipo == TipoDia.Rutina);

            var porcentaje = diasTotales > 0 ? (double)diasCompletados / diasTotales * 100 : 0;

            return new ProgresoGeneralDto
            {
                ProgramaId = programa.Id,
                PacienteId = programa.PacienteId,
                PacienteNombre = programa.Paciente?.FullName ?? "",
                FechaInicio = programa.FechaInicio,
                FechaFin = programa.FechaFin,
                DiasCompletados = diasCompletados,
                DiasDescanso = diasDescanso,
                DiasRestantes = diasTotales - diasCompletados,
                DiasTotales = diasTotales,
                PorcentajeCompletado = Math.Round(porcentaje, 2)
            };
        }

        public async Task<bool> EliminarProgramaAsync(int programaId, Guid fisioterapeutaId)
        {
            var programa = await _programaRepository.GetByIdAsync(programaId);
            
            if (programa == null || programa.FisioterapeutaId != fisioterapeutaId)
                return false;

            return await _programaRepository.DeleteAsync(programaId);
        }

        private ProgramaDetalleDto MapToDetalleDto(ProgramaRehabilitacion programa)
        {
            var diasCompletados = programa.Semanas
                .SelectMany(s => s.Dias)
                .Count(d => d.Completado && d.Tipo == TipoDia.Rutina);

            var diasTotales = programa.Semanas
                .SelectMany(s => s.Dias)
                .Count(d => d.Tipo == TipoDia.Rutina);

            return new ProgramaDetalleDto
            {
                Id = programa.Id,
                PacienteId = programa.PacienteId,
                PacienteNombre = programa.Paciente?.FullName ?? "",
                FisioterapeutaId = programa.FisioterapeutaId,
                FisioterapeutaNombre = programa.Fisioterapeuta?.FullName ?? "",
                Nombre = programa.Nombre,
                Descripcion = programa.Descripcion,
                Diagnostico = programa.Diagnostico,
                FechaInicio = programa.FechaInicio,
                FechaFin = programa.FechaFin,
                TotalSemanas = programa.TotalSemanas,
                SemanaActual = programa.SemanaActual,
                Activo = programa.Activo,
                DiasCompletados = diasCompletados,
                DiasTotales = diasTotales,
                Semanas = programa.Semanas.Select(s => MapToSemanaDetalleDto(s, programa.SemanaActual)).ToList()
            };
        }

        private SemanaDetalleDto MapToSemanaDetalleDto(SemanaRutina semana, int semanaActual)
        {
            var diasCompletados = semana.Dias.Count(d => d.Completado);
            var diasTotales = semana.Dias.Count;

            string estado;
            if (semana.NumeroSemana < semanaActual)
                estado = "completada";
            else if (semana.NumeroSemana == semanaActual)
                estado = "en-progreso";
            else
                estado = "pendiente";

            return new SemanaDetalleDto
            {
                Id = semana.Id,
                NumeroSemana = semana.NumeroSemana,
                Estado = estado,
                Dias = semana.Dias.OrderBy(d => d.OrdenDia).Select(MapToDiaDetalleDto).ToList()
            };
        }

        private DiaDetalleDto MapToDiaDetalleDto(DiaRutina dia)
        {
            return new DiaDetalleDto
            {
                Id = dia.Id,
                NombreDia = dia.NombreDia,
                OrdenDia = dia.OrdenDia,
                Tipo = dia.Tipo == TipoDia.Rutina ? "rutina" : "descanso",
                NombreRutina = dia.NombreRutina,
                Completado = dia.Completado,
                FechaCompletado = dia.FechaCompletado,
                CantidadEjercicios = dia.Ejercicios.Count,
                Ejercicios = dia.Ejercicios.OrderBy(e => e.Orden).Select(e => MapToEjercicioDetalleDto(e, dia.Progresos)).ToList()
            };
        }

        private EjercicioDetalleDto MapToEjercicioDetalleDto(Ejercicio ejercicio, ICollection<ProgresoEjercicio> progresos)
        {
            var progreso = progresos.FirstOrDefault(p => p.EjercicioId == ejercicio.Id);
            List<string> instrucciones;

            try
            {
                instrucciones = JsonSerializer.Deserialize<List<string>>(ejercicio.InstruccionesJson) ?? new List<string>();
            }
            catch
            {
                instrucciones = new List<string>();
            }

            return new EjercicioDetalleDto
            {
                Id = ejercicio.Id,
                Orden = ejercicio.Orden,
                Nombre = ejercicio.Nombre,
                Descripcion = ejercicio.Descripcion,
                Repeticiones = ejercicio.Repeticiones,
                TiempoDescanso = ejercicio.TiempoDescanso,
                Instrucciones = instrucciones,
                Completado = progreso?.Completado ?? false
            };
        }
    }
}
