using System;
using System.ComponentModel.DataAnnotations;

namespace FisioAppAPI.DTOs
{
    public class MarcarDiaCompletadoDto
    {
        [Required]
        public int DiaRutinaId { get; set; }

        [Required]
        public bool Completado { get; set; }
    }

    public class MarcarEjercicioCompletadoDto
    {
        [Required]
        public int EjercicioId { get; set; }

        [Required]
        public int DiaRutinaId { get; set; }

        [Required]
        public bool Completado { get; set; }

        [MaxLength(1000)]
        public string? Notas { get; set; }
    }

    public class ProgresoGeneralDto
    {
        public int ProgramaId { get; set; }
        public Guid PacienteId { get; set; }
        public string PacienteNombre { get; set; } = string.Empty;
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public int DiasCompletados { get; set; }
        public int DiasDescanso { get; set; }
        public int DiasRestantes { get; set; }
        public int DiasTotales { get; set; }
        public double PorcentajeCompletado { get; set; }
    }
}
