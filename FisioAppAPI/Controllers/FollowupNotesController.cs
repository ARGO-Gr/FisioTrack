using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FisioAppAPI.Interfaces;

namespace FisioAppAPI.Controllers;

[ApiController]
[Route("api/followup-notes")]
[Authorize]
public class FollowupNotesController : ControllerBase
{
    private readonly IFollowupNoteService _service;
    private readonly ILogger<FollowupNotesController> _logger;

    public FollowupNotesController(IFollowupNoteService service, ILogger<FollowupNotesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get followup note by appointment ID
    /// </summary>
    [HttpGet("{appointmentId:guid}")]
    public async Task<ActionResult> GetByAppointmentId(Guid appointmentId)
    {
        try
        {
            var note = await _service.GetByAppointmentIdAsync(appointmentId);
            if (note == null)
            {
                return NotFound();
            }

            return Ok(note);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting followup note for appointment {AppointmentId}", appointmentId);
            return StatusCode(500, new { message = "Error getting followup note" });
        }
    }

    /// <summary>
    /// Create a new followup note
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateFollowupNoteDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Contenido))
            {
                return BadRequest(new { message = "Content cannot be empty" });
            }

            var note = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetByAppointmentId), new { appointmentId = note.AppointmentId }, note);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating followup note");
            return StatusCode(500, new { message = "Error creating followup note" });
        }
    }

    /// <summary>
    /// Update an existing followup note
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateFollowupNoteDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Contenido))
            {
                return BadRequest(new { message = "Content cannot be empty" });
            }

            var note = await _service.UpdateAsync(id, dto);
            return Ok(note);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating followup note {NoteId}", id);
            return StatusCode(500, new { message = "Error updating followup note" });
        }
    }

    /// <summary>
    /// Delete a followup note
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting followup note {NoteId}", id);
            return StatusCode(500, new { message = "Error deleting followup note" });
        }
    }

    /// <summary>
    /// Get all followup notes for a patient
    /// </summary>
    [HttpGet("patient/{patientId:guid}")]
    public async Task<ActionResult> GetByPatientId(Guid patientId)
    {
        try
        {
            var notes = await _service.GetByPatientIdAsync(patientId);
            return Ok(notes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting followup notes for patient {PatientId}", patientId);
            return StatusCode(500, new { message = "Error getting followup notes" });
        }
    }
}
