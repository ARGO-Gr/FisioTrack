using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FisioAppAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    /// <summary>
    /// Endpoint de prueba para verificar conectividad
    /// </summary>
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { message = "API está respondiendo correctamente" });
    }

    /// <summary>
    /// Endpoint para verificar autenticación (requiere token)
    /// </summary>
    [HttpGet("test-auth")]
    [Authorize]
    public IActionResult TestAuth()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        var identity = User.Identity;
        return Ok(new 
        { 
            message = "Autenticación exitosa",
            isAuthenticated = User.Identity?.IsAuthenticated,
            userName = User.Identity?.Name,
            claims = claims
        });
    }

    /// <summary>
    /// Endpoint para debug detallado de JWT
    /// </summary>
    [HttpGet("debug-jwt")]
    public IActionResult DebugJwt()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        var hasAuthHeader = !string.IsNullOrEmpty(authHeader);
        var hasBearer = authHeader.StartsWith("Bearer ");
        var token = hasBearer ? authHeader.Substring("Bearer ".Length) : null;
        
        return Ok(new
        {
            hasAuthorizationHeader = hasAuthHeader,
            authHeaderValue = authHeader,
            hasBearerPrefix = hasBearer,
            tokenPresent = !string.IsNullOrEmpty(token),
            isAuthenticated = User.Identity?.IsAuthenticated,
            userClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList(),
            requestHeaders = Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())
        });
    }

    /// <summary>
    /// Obtiene todas las citas de un día específico para un fisioterapeuta
    /// </summary>
    /// <param name="fisioterapeutaId">ID del fisioterapeuta</param>
    /// <param name="fecha">Fecha en formato YYYY-MM-DD</param>
    [HttpGet("dia/{fisioterapeutaId}")]
    [Authorize]
    public async Task<ActionResult<List<AppointmentDto>>> GetAppointmentsByDay(
        Guid fisioterapeutaId,
        [FromQuery] string fecha)
    {
        try
        {
            if (string.IsNullOrEmpty(fecha))
                return BadRequest(new { message = "La fecha es requerida en formato YYYY-MM-DD" });

            var appointments = await _appointmentService.GetFisioterapeutaAppointmentsAsync(fisioterapeutaId, fecha);
            return Ok(appointments);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene todas las citas de un rango de fechas para un fisioterapeuta
    /// </summary>
    /// <param name="fisioterapeutaId">ID del fisioterapeuta</param>
    /// <param name="fechaInicio">Fecha de inicio en formato YYYY-MM-DD</param>
    /// <param name="fechaFin">Fecha de fin en formato YYYY-MM-DD</param>
    [HttpGet("rango/{fisioterapeutaId}")]
    [Authorize]
    public async Task<ActionResult<List<AppointmentDto>>> GetAppointmentsByDateRange(
        Guid fisioterapeutaId,
        [FromQuery] string fechaInicio,
        [FromQuery] string fechaFin)
    {
        try
        {
            if (string.IsNullOrEmpty(fechaInicio) || string.IsNullOrEmpty(fechaFin))
                return BadRequest(new { message = "Las fechas de inicio y fin son requeridas en formato YYYY-MM-DD" });

            var appointments = await _appointmentService.GetFisioterapeutaAppointmentsByDateRangeAsync(fisioterapeutaId, fechaInicio, fechaFin);
            return Ok(appointments);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene todas las citas de un paciente específico
    /// </summary>
    /// <param name="pacienteId">ID del paciente</param>
    [HttpGet("paciente/{pacienteId}")]
    [Authorize]
    public async Task<ActionResult<List<AppointmentDto>>> GetPatientAppointments(Guid pacienteId)
    {
        try
        {
            var appointments = await _appointmentService.GetPatientAppointmentsAsync(pacienteId);
            return Ok(appointments);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Búsqueda en vivo de pacientes por nombre o email en toda la base de datos
    /// </summary>
    /// <param name="search">Término de búsqueda (nombre o email)</param>
    [HttpGet("buscar-pacientes")]
    [Authorize]
    public async Task<ActionResult<List<PatientListItemDto>>> SearchPatients(
        [FromQuery] string? search = null)
    {
        try
        {
            if (string.IsNullOrEmpty(search))
                return BadRequest(new { message = "El término de búsqueda es requerido" });

            var pacientes = await _appointmentService.SearchAllPatientsAsync(search);
            return Ok(pacientes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva cita
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<AppointmentDto>> CreateAppointment([FromBody] CreateAppointmentDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var appointment = await _appointmentService.CreateAppointmentAsync(dto);
            return CreatedAtAction(nameof(GetAppointmentById), new { id = appointment.Id }, appointment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", detail = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene una cita específica por su ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<AppointmentDto>> GetAppointmentById(Guid id)
    {
        try
        {
            var appointment = await _appointmentService.GetAppointmentAsync(id);
            if (appointment == null)
                return NotFound(new { message = "La cita no existe." });

            return Ok(appointment);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza una cita existente
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<AppointmentDto>> UpdateAppointment(
        Guid id,
        [FromBody] UpdateAppointmentDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var appointment = await _appointmentService.UpdateAppointmentAsync(id, dto);
            return Ok(appointment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", detail = ex.Message });
        }
    }

    /// <summary>
    /// Elimina una cita
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteAppointment(Guid id)
    {
        try
        {
            var result = await _appointmentService.DeleteAppointmentAsync(id);
            if (!result)
                return NotFound(new { message = "La cita no existe." });

            return Ok(new { message = "La cita ha sido eliminada exitosamente." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cambia el estado de una cita
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<ActionResult<AppointmentDto>> ChangeAppointmentStatus(
        Guid id,
        [FromBody] ChangeAppointmentStatusDto dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.Estado))
                return BadRequest(new { message = "El estado es requerido." });

            var appointment = await _appointmentService.ChangeAppointmentStatusAsync(id, dto.Estado);
            return Ok(appointment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", detail = ex.Message });
        }
    }

    /// <summary>
    /// Cambia el estado del fisio en una cita
    /// </summary>
    [HttpPatch("{id}/status-fisio")]
    [Authorize]
    public async Task<ActionResult<AppointmentDto>> ChangeAppointmentStatusFisio(
        Guid id,
        [FromBody] ChangeAppointmentStatusFisioDto dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.EstadoFisio))
                return BadRequest(new { message = "El estado del fisio es requerido." });

            var appointment = await _appointmentService.ChangeAppointmentStatusFisioAsync(id, dto.EstadoFisio);
            return Ok(appointment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", detail = ex.Message });
        }
    }

    /// <summary>
    /// Cambia el estado del paciente en una cita
    /// </summary>
    [HttpPatch("{id}/status-paciente")]
    [Authorize]
    public async Task<ActionResult<AppointmentDto>> ChangeAppointmentStatusPaciente(
        Guid id,
        [FromBody] ChangeAppointmentStatusPacienteDto dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.EstadoPaciente))
                return BadRequest(new { message = "El estado del paciente es requerido." });

            var appointment = await _appointmentService.ChangeAppointmentStatusPacienteAsync(id, dto.EstadoPaciente);
            return Ok(appointment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", detail = ex.Message });
        }
    }
}