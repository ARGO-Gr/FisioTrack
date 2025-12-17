using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FisioAppAPI.Models
{
    public enum TipoDia
    {
        Rutina,
        Descanso
    }

    public class DiaRutina
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SemanaId { get; set; }

        [ForeignKey("SemanaId")]
        public SemanaRutina? Semana { get; set; }

        [Required]
        [MaxLength(20)]
        public string NombreDia { get; set; } = string.Empty; // Lunes, Martes, etc.

        [Required]
        public int OrdenDia { get; set; } // 0-6 para ordenar

        [Required]
        public TipoDia Tipo { get; set; }

        [MaxLength(200)]
        public string? NombreRutina { get; set; }

        public bool Completado { get; set; } = false;

        public DateTime? FechaCompletado { get; set; }

        // Campos para control de incumplimientos y bloqueos
        public bool Incumplido { get; set; } = false;

        public DateTime? FechaIncumplimiento { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public ICollection<Ejercicio> Ejercicios { get; set; } = new List<Ejercicio>();
        public ICollection<ProgresoEjercicio> Progresos { get; set; } = new List<ProgresoEjercicio>();
    }
}
