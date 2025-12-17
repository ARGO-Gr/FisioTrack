using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FisioAppAPI.Models
{
    public class ProgramaRehabilitacion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Guid PacienteId { get; set; }

        [ForeignKey("PacienteId")]
        public User? Paciente { get; set; }

        [Required]
        public Guid FisioterapeutaId { get; set; }

        [ForeignKey("FisioterapeutaId")]
        public User? Fisioterapeuta { get; set; }

        [Required]
        [MaxLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Diagnostico { get; set; } = string.Empty;

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaFin { get; set; }

        public int TotalSemanas { get; set; }

        public int SemanaActual { get; set; } = 1;

        public bool Activo { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        // Relaciones
        public ICollection<SemanaRutina> Semanas { get; set; } = new List<SemanaRutina>();
    }
}
