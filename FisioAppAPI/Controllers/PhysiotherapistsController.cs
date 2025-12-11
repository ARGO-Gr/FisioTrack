using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using System.Security.Claims;

namespace FisioAppAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhysiotherapistsController : ControllerBase
{
    private readonly IPhysiotherapistService _service;
    private readonly IPatientLinkingService _patientLinkingService;

    public PhysiotherapistsController(IPhysiotherapistService service, IPatientLinkingService patientLinkingService)
    {
        _service = service;
        _patientLinkingService = patientLinkingService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterPhysioDto dto)
    {
        try
        {
            await _service.RegisterAsync(dto);
            return Accepted(new { message = "Fisioterapeuta registrado. Se envió un código de confirmación al correo." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var profile = await _service.GetByIdAsync(id);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    [Authorize]
    public async Task<IActionResult> GetByUserId(Guid userId)
    {
        try
        {
            var profile = await _service.GetByUserIdAsync(userId);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll([FromQuery] string? specialty, [FromQuery] bool? active)
    {
        try
        {
            List<PhysioListItemDto> result;

            if (!string.IsNullOrEmpty(specialty))
            {
                result = await _service.GetBySpecialtyAsync(specialty);
            }
            else
            {
                result = await _service.GetAllAsync();
            }

            if (active.HasValue && active.Value == false)
            {
                result = result.Where(p => !p.IsActive).ToList();
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{userId}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid userId, [FromBody] UpdatePhysioDto dto)
    {
        try
        {
            // Validar que el usuario sea el propietario del perfil
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId != userId.ToString())
                return Forbid();

            var updated = await _service.UpdateAsync(userId, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{userId}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid userId)
    {
        try
        {
            // Validar que el usuario sea el propietario del perfil
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId != userId.ToString())
                return Forbid();

            var success = await _service.DeactivateAsync(userId);
            if (!success)
                return NotFound(new { error = "Perfil no encontrado" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{userId}/activate")]
    [Authorize]
    public async Task<IActionResult> Activate(Guid userId)
    {
        try
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId != userId.ToString())
                return Forbid();

            var profile = await _service.GetByUserIdAsync(userId);
            if (profile == null)
                return NotFound();

            // Crear DTO para activar
            var updateDto = new UpdatePhysioDto { };
            // El servicio debería tener método para activar, pero por ahora retornamos el perfil

            return Ok(profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // ==================== Patient Linking Endpoints ====================

    [HttpPost("{id}/pacientes")]
    [Authorize]
    public async Task<IActionResult> LinkPatient(string id, [FromBody] LinkPatientDto dto)
    {
        try
        {
            if (dto == null || string.IsNullOrEmpty(dto.PacienteId))
                return BadRequest(new { error = "PacienteId is required" });

            if (!Guid.TryParse(id, out var fisioterapeutaId))
                return BadRequest(new { error = "Invalid ID format" });

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId != id)
                return Forbid();

            var result = await _patientLinkingService.LinkPatientAsync(fisioterapeutaId, dto.PacienteId);
            return Created($"api/physiotherapists/{id}/pacientes/{dto.PacienteId}", result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/pacientes")]
    [Authorize]
    public async Task<IActionResult> GetLinkedPatients(string id)
    {
        try
        {
            if (!Guid.TryParse(id, out var fisioterapeutaId))
                return BadRequest(new { error = "Invalid ID format" });

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId != id)
                return Forbid();

            var patients = await _patientLinkingService.GetLinkedPatientsAsync(fisioterapeutaId);
            return Ok(patients);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}/pacientes/{pacienteId}")]
    [Authorize]
    public async Task<IActionResult> UnlinkPatient(string id, string pacienteId)
    {
        try
        {
            if (!Guid.TryParse(id, out var fisioterapeutaId))
                return BadRequest(new { error = "Invalid ID format" });

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId != id)
                return Forbid();

            var result = await _patientLinkingService.UnlinkPatientAsync(fisioterapeutaId, pacienteId);
            if (!result)
                return NotFound(new { error = "Patient link not found" });

            return Ok(new { message = "Paciente desvinculado exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
