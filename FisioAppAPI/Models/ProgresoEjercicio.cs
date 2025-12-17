using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FisioAppAPI.Models
{
    public class ProgresoEjercicio
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EjercicioId { get; set; }

        [ForeignKey("EjercicioId")]
        public Ejercicio? Ejercicio { get; set; }

        [Required]
        public int DiaRutinaId { get; set; }

        [ForeignKey("DiaRutinaId")]
        public DiaRutina? DiaRutina { get; set; }

        [Required]
        public Guid PacienteId { get; set; }

        [ForeignKey("PacienteId")]
        public User? Paciente { get; set; }

        public bool Completado { get; set; } = false;

        public DateTime? FechaCompletado { get; set; }

        [MaxLength(1000)]
        public string? Notas { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}
