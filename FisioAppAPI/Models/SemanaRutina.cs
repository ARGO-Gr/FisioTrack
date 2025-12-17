using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FisioAppAPI.Models
{
    public class SemanaRutina
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProgramaId { get; set; }

        [ForeignKey("ProgramaId")]
        public ProgramaRehabilitacion? Programa { get; set; }

        [Required]
        public int NumeroSemana { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public ICollection<DiaRutina> Dias { get; set; } = new List<DiaRutina>();
    }
}
