using System;
using System.Collections.Generic;

namespace FisioAppAPI.DTOs
{
    public class ProgramaDetalleDto
    {
        public int Id { get; set; }
        public Guid PacienteId { get; set; }
        public string PacienteNombre { get; set; } = string.Empty;
        public Guid FisioterapeutaId { get; set; }
        public string FisioterapeutaNombre { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Diagnostico { get; set; } = string.Empty;
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public int TotalSemanas { get; set; }
        public int SemanaActual { get; set; }
        public bool Activo { get; set; }
        public int DiasCompletados { get; set; }
        public int DiasTotales { get; set; }
        public List<SemanaDetalleDto> Semanas { get; set; } = new List<SemanaDetalleDto>();
    }

    public class SemanaDetalleDto
    {
        public int Id { get; set; }
        public int NumeroSemana { get; set; }
        public string Estado { get; set; } = string.Empty; // "completada", "en-progreso", "pendiente"
        public List<DiaDetalleDto> Dias { get; set; } = new List<DiaDetalleDto>();
    }

    public class DiaDetalleDto
    {
        public int Id { get; set; }
        public string NombreDia { get; set; } = string.Empty;
        public int OrdenDia { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string? NombreRutina { get; set; }
        public bool Completado { get; set; }
        public DateTime? FechaCompletado { get; set; }
        public int CantidadEjercicios { get; set; }
        public List<EjercicioDetalleDto> Ejercicios { get; set; } = new List<EjercicioDetalleDto>();
    }

    public class EjercicioDetalleDto
    {
        public int Id { get; set; }
        public int Orden { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public int Repeticiones { get; set; }
        public int TiempoDescanso { get; set; }
        public List<string> Instrucciones { get; set; } = new List<string>();
        public bool Completado { get; set; }
    }
}
