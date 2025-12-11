using Microsoft.AspNetCore.Mvc;
using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using Microsoft.Extensions.Options;
using FisioAppAPI.Models;

namespace FisioAppAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IEmailSender _emailSender;
    private readonly AppSettings _appSettings;
    private readonly ILogger<ContactController> _logger;

    public ContactController(
        IEmailSender emailSender,
        IOptions<AppSettings> appSettings,
        ILogger<ContactController> logger)
    {
        _emailSender = emailSender;
        _appSettings = appSettings.Value;
        _logger = logger;
    }

    /// <summary>
    /// Endpoint de prueba para verificar conectividad
    /// </summary>
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { message = "API está respondiendo correctamente", timestamp = DateTime.UtcNow });
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendContactMessage([FromBody] ContactDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(dto.Name) || 
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Subject) ||
                string.IsNullOrWhiteSpace(dto.Message))
            {
                return BadRequest(new { error = "Todos los campos son requeridos" });
            }

            // Validar formato de email básico
            try
            {
                var addr = new System.Net.Mail.MailAddress(dto.Email);
                if (addr.Address != dto.Email)
                    return BadRequest(new { error = "Correo electrónico inválido" });
            }
            catch
            {
                return BadRequest(new { error = "Correo electrónico inválido" });
            }

            // Construir el cuerpo del correo HTML
            var emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #0066cc; color: white; padding: 20px; border-radius: 5px; }}
        .content {{ padding: 20px; border: 1px solid #ddd; margin-top: 20px; }}
        .footer {{ margin-top: 20px; font-size: 12px; color: #999; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>Nuevo Mensaje de Contacto - FisioTrack</h2>
        </div>
        <div class=""content"">
            <p><strong>Nombre:</strong> {dto.Name}</p>
            <p><strong>Correo:</strong> {dto.Email}</p>
            <p><strong>Asunto:</strong> {dto.Subject}</p>
            <hr />
            <p><strong>Mensaje:</strong></p>
            <p>{dto.Message.Replace(Environment.NewLine, "<br />")}</p>
        </div>
        <div class=""footer"">
            <p>Este correo fue enviado desde el formulario de contacto de FisioTrack</p>
        </div>
    </div>
</body>
</html>";

            // Enviar correo al administrador/soporte
            var adminEmail = _appSettings.AdminEmail ?? "admin@fisiotrack.com";
            await _emailSender.SendAsync(
                adminEmail,
                $"Nuevo Mensaje de Contacto: {dto.Subject}",
                emailBody);

            _logger.LogInformation($"Mensaje de contacto recibido de {dto.Email}");

            // Enviar confirmación al usuario
            var confirmationBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #0066cc; color: white; padding: 20px; border-radius: 5px; }}
        .content {{ padding: 20px; border: 1px solid #ddd; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>Gracias por tu Mensaje - FisioTrack</h2>
        </div>
        <div class=""content"">
            <p>Hola {dto.Name},</p>
            <p>Recibimos tu mensaje y nos pondremos en contacto pronto.</p>
            <p>Agradecemos tu interés en FisioTrack.</p>
            <br />
            <p>Saludos,<br />Equipo FisioTrack</p>
        </div>
    </div>
</body>
</html>";

            await _emailSender.SendAsync(
                dto.Email,
                "Hemos recibido tu mensaje - FisioTrack",
                confirmationBody);

            return Ok(new { message = "Mensaje enviado correctamente. Nos pondremos en contacto pronto." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al enviar mensaje de contacto: {ex.Message}");
            return StatusCode(500, new { error = "Error al enviar el mensaje. Intenta más tarde." });
        }
    }
}
