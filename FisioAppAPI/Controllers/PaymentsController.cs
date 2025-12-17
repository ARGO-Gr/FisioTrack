using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FisioAppAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// Crear un nuevo pago
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto createPaymentDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var fisioterapeutaId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var payment = await _paymentService.CreatePaymentAsync(createPaymentDto, fisioterapeutaId);
            
            if (payment == null)
            {
                return NotFound(new { message = "No se pudo crear el pago. Verifica que la cita existe." });
            }

            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al crear el pago", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener todos los pagos del fisioterapeuta
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetPayments()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var fisioterapeutaId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var payments = await _paymentService.GetPaymentsByFisioterapeutaIdAsync(fisioterapeutaId);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al obtener los pagos", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener un pago por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPaymentById(Guid id)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var fisioterapeutaId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var payment = await _paymentService.GetPaymentByIdAsync(id, fisioterapeutaId);
            
            if (payment == null)
            {
                return NotFound(new { message = "Pago no encontrado" });
            }

            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al obtener el pago", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener pago por ID de cita
    /// </summary>
    [HttpGet("by-appointment/{appointmentId}")]
    public async Task<IActionResult> GetPaymentByAppointmentId(Guid appointmentId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var fisioterapeutaId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var payment = await _paymentService.GetPaymentByAppointmentIdAsync(appointmentId, fisioterapeutaId);
            
            if (payment == null)
            {
                return NotFound(new { message = "No se encontró un pago para esta cita" });
            }

            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al obtener el pago", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener pagos pendientes del paciente
    /// </summary>
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingPayments()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var pacienteId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var payments = await _paymentService.GetPendingPaymentsByPacienteIdAsync(pacienteId);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al obtener los pagos pendientes", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener todos los pagos del paciente (pendientes y completados)
    /// </summary>
    [HttpGet("patient/all")]
    public async Task<IActionResult> GetAllPaymentsByPatient()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var pacienteId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var payments = await _paymentService.GetAllPaymentsByPacienteIdAsync(pacienteId);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al obtener los pagos", error = ex.Message });
        }
    }

    /// <summary>
    /// Confirmar un pago pendiente (paciente ingresa datos de tarjeta)
    /// </summary>
    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmPayment(Guid id, [FromBody] ConfirmPaymentDto confirmPaymentDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var pacienteId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var payment = await _paymentService.ConfirmPaymentAsync(
                id, 
                pacienteId, 
                confirmPaymentDto.NumeroTarjeta,
                confirmPaymentDto.TitularTarjeta,
                confirmPaymentDto.NumeroAutorizacion
            );
            
            if (payment == null)
            {
                return NotFound(new { message = "Pago no encontrado o ya fue confirmado" });
            }

            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al confirmar el pago", error = ex.Message });
        }
    }
}
