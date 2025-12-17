using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FisioAppAPI.Models
{
    public class Ejercicio
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DiaRutinaId { get; set; }

        [ForeignKey("DiaRutinaId")]
        public DiaRutina? DiaRutina { get; set; }

        [Required]
        public int Orden { get; set; }

        [Required]
        [MaxLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public int Repeticiones { get; set; }

        [Required]
        public int TiempoDescanso { get; set; } // en segundos

        // Instrucciones almacenadas como JSON string
        [Required]
        public string InstruccionesJson { get; set; } = "[]";

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public ICollection<ProgresoEjercicio> Progresos { get; set; } = new List<ProgresoEjercicio>();
    }
}
