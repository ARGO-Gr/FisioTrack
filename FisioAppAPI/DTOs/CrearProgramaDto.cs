using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FisioAppAPI.DTOs
{
    public class CrearProgramaDto
    {
        [Required(ErrorMessage = "El ID del paciente es requerido")]
        public Guid PacienteId { get; set; }

        [Required(ErrorMessage = "El nombre del programa es requerido")]
        [MaxLength(200)]
        public string NombrePrograma { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Descripcion { get; set; } = string.Empty;

        [Required(ErrorMessage = "El diagnóstico es requerido")]
        [MaxLength(500)]
        public string Diagnostico { get; set; } = string.Empty;

        [Required(ErrorMessage = "El número de semanas es requerido")]
        [Range(1, int.MaxValue, ErrorMessage = "Debe haber al menos 1 semana")]
        public int Semanas { get; set; }

        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime FechaInicio { get; set; }

        [Required(ErrorMessage = "Las semanas son requeridas")]
        public List<CrearSemanaDto> SemanasRutina { get; set; } = new List<CrearSemanaDto>();
    }

    public class CrearSemanaDto
    {
        [Required]
        public int NumeroSemana { get; set; }

        [Required]
        public List<CrearDiaDto> Dias { get; set; } = new List<CrearDiaDto>();
    }

    public class CrearDiaDto
    {
        [Required]
        [MaxLength(20)]
        public string NombreDia { get; set; } = string.Empty;

        [Required]
        public int OrdenDia { get; set; }

        [Required]
        public string Tipo { get; set; } = string.Empty; // "rutina" o "descanso"

        [MaxLength(200)]
        public string? NombreRutina { get; set; }

        public List<CrearEjercicioDto>? Ejercicios { get; set; }
    }

    public class CrearEjercicioDto
    {
        [Required]
        public int Orden { get; set; }

        [Required]
        [MaxLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        [Range(1, 1000)]
        public int Repeticiones { get; set; }

        [Required]
        [Range(0, 600)]
        public int TiempoDescanso { get; set; }

        [Required]
        public List<string> Instrucciones { get; set; } = new List<string>();
    }
}
