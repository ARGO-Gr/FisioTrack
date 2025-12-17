using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;

namespace FisioAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProgramasController : ControllerBase
    {
        private readonly IProgramaService _programaService;

        public ProgramasController(IProgramaService programaService)
        {
            _programaService = programaService;
        }

        // POST: api/programas/crear
        // Fisioterapeuta crea un programa para un paciente
        [HttpPost("crear")]
        [Authorize(Roles = "physiotherapist")]
        public async Task<IActionResult> CrearPrograma([FromBody] CrearProgramaDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var programa = await _programaService.CrearProgramaAsync(userGuid, dto);

                if (programa == null)
                    return BadRequest(new { message = "Error al crear el programa" });

                return Ok(new
                {
                    message = "Programa creado exitosamente",
                    programa
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el programa", error = ex.Message });
            }
        }

        // GET: api/programas/{id}
        // Obtener detalle de un programa (Fisioterapeuta o Paciente)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPrograma(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var programa = await _programaService.GetProgramaDetalleAsync(id, userGuid);

                if (programa == null)
                    return NotFound(new { message = "Programa no encontrado o sin acceso" });

                return Ok(programa);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el programa", error = ex.Message });
            }
        }

        // GET: api/programas/paciente/activo
        // Paciente obtiene su programa activo
        [HttpGet("paciente/activo")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> GetProgramaActivo()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var programa = await _programaService.GetProgramaActivoByPacienteAsync(userGuid);

                if (programa == null)
                    return NotFound(new { message = "No hay programa activo" });

                return Ok(programa);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el programa activo", error = ex.Message });
            }
        }

        // GET: api/programas/paciente/mis-programas
        // Paciente obtiene todos sus programas
        [HttpGet("paciente/mis-programas")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> GetMisProgramas()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var programas = await _programaService.GetProgramasByPacienteAsync(userGuid);

                return Ok(programas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener programas", error = ex.Message });
            }
        }

        // GET: api/programas/fisioterapeuta/mis-programas
        // Fisioterapeuta obtiene todos los programas que ha creado
        [HttpGet("fisioterapeuta/mis-programas")]
        [Authorize(Roles = "physiotherapist")]
        public async Task<IActionResult> GetProgramasFisioterapeuta()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var programas = await _programaService.GetProgramasByFisioterapeutaAsync(userGuid);

                return Ok(programas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener programas", error = ex.Message });
            }
        }

        // GET: api/programas/paciente/{pacienteId}/programas
        // Fisioterapeuta obtiene programas de un paciente específico
        [HttpGet("paciente/{pacienteId}/programas")]
        [Authorize(Roles = "physiotherapist")]
        public async Task<IActionResult> GetProgramasPaciente(string pacienteId)
        {
            try
            {
                if (!Guid.TryParse(pacienteId, out var pacienteGuid))
                    return BadRequest(new { message = "ID de paciente inválido" });

                var programas = await _programaService.GetProgramasByPacienteAsync(pacienteGuid);
                return Ok(programas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener programas del paciente", error = ex.Message });
            }
        }

        // GET: api/programas/paciente/{pacienteId}/activo
        // Fisioterapeuta obtiene el programa activo de un paciente específico
        [HttpGet("paciente/{pacienteId}/activo")]
        [Authorize(Roles = "physiotherapist")]
        public async Task<IActionResult> GetProgramaActivoPaciente(string pacienteId)
        {
            try
            {
                if (!Guid.TryParse(pacienteId, out var pacienteGuid))
                    return BadRequest(new { message = "ID de paciente inválido" });

                var programa = await _programaService.GetProgramaActivoByPacienteAsync(pacienteGuid);

                if (programa == null)
                    return NotFound(new { message = "No hay programa activo para este paciente" });

                return Ok(programa);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el programa activo del paciente", error = ex.Message });
            }
        }

        // PUT: api/programas/{id}
        // Fisioterapeuta actualiza un programa existente
        [HttpPut("{id}")]
        [Authorize(Roles = "physiotherapist")]
        public async Task<IActionResult> ActualizarPrograma(int id, [FromBody] CrearProgramaDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var programa = await _programaService.ActualizarProgramaAsync(id, userGuid, dto);

                if (programa == null)
                    return NotFound(new { message = "Programa no encontrado o sin acceso" });

                return Ok(new
                {
                    message = "Programa actualizado exitosamente",
                    programa
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el programa", error = ex.Message });
            }
        }

        // POST: api/programas/dia/completar
        // Paciente marca un día como completado
        [HttpPost("dia/completar")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> MarcarDiaCompletado([FromBody] MarcarDiaCompletadoDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var resultado = await _programaService.MarcarDiaCompletadoAsync(userGuid, dto);

                if (!resultado)
                    return BadRequest(new { message = "Error al marcar el día" });

                return Ok(new { message = "Día marcado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al marcar el día", error = ex.Message });
            }
        }

        // POST: api/programas/ejercicio/completar
        // Paciente marca un ejercicio como completado
        [HttpPost("ejercicio/completar")]
        [Authorize(Roles = "patient")]
        public async Task<IActionResult> MarcarEjercicioCompletado([FromBody] MarcarEjercicioCompletadoDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var resultado = await _programaService.MarcarEjercicioCompletadoAsync(userGuid, dto);

                if (!resultado)
                    return BadRequest(new { message = "Error al marcar el ejercicio" });

                return Ok(new { message = "Ejercicio marcado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al marcar el ejercicio", error = ex.Message });
            }
        }

        // GET: api/programas/{id}/progreso
        // Obtener progreso general del programa (Fisioterapeuta o Paciente)
        [HttpGet("{id}/progreso")]
        public async Task<IActionResult> GetProgresoGeneral(int id)
        {
            try
            {
                var progreso = await _programaService.GetProgresoGeneralAsync(id);

                if (progreso == null)
                    return NotFound(new { message = "Programa no encontrado" });

                return Ok(progreso);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el progreso", error = ex.Message });
            }
        }

        // DELETE: api/programas/{id}
        // Fisioterapeuta elimina un programa
        [HttpDelete("{id}")]
        [Authorize(Roles = "physiotherapist")]
        public async Task<IActionResult> EliminarPrograma(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var resultado = await _programaService.EliminarProgramaAsync(id, userGuid);

                if (!resultado)
                    return BadRequest(new { message = "Error al eliminar el programa o sin permisos" });

                return Ok(new { message = "Programa eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el programa", error = ex.Message });
            }
        }
    }
}
