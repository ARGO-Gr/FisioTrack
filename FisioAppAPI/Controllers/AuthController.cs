using Microsoft.AspNetCore.Mvc;
using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Services;
using FisioAppAPI.Models;
using Microsoft.Extensions.Options;

namespace FisioAppAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IHtmlResponseService _htmlResponseService;
    private readonly AppSettings _appSettings;

    public AuthController(
        IUserService userService,
        IHtmlResponseService htmlResponseService,
        IOptions<AppSettings> appSettings)
    {
        _userService = userService;
        _htmlResponseService = htmlResponseService;
        _appSettings = appSettings.Value;
    }

// si
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            await _userService.RegisterAsync(dto);
            return Accepted(new { message = "Usuario creado. Se envió un enlace de confirmación al correo." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

// si
    [HttpPost("confirm")]
    public async Task<IActionResult> Confirm([FromBody] ConfirmDto dto)
    {
        var ok = await _userService.ConfirmAsync(dto);
        if (!ok) return BadRequest(new { error = "Token inválido o expirado" });
        return Ok(new { message = "Cuenta confirmada exitosamente" });
    }

// si
    [HttpGet("confirm")]
    public async Task<IActionResult> ConfirmFromLink([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            var errorHtml = _htmlResponseService.GenerateErrorHtml(
                "Error de Confirmación",
                "No se proporcionó un token válido. Por favor, verifica el enlace en tu correo.");
            return Content(errorHtml, "text/html");
        }

        var dto = new ConfirmDto { Token = token };
        var ok = await _userService.ConfirmAsync(dto);

        if (!ok)
        {
            var errorHtml = _htmlResponseService.GenerateErrorHtml(
                "Error de Confirmación",
                "El token es inválido o ha expirado. Por favor, solicita un nuevo enlace de confirmación.");
            return Content(errorHtml, "text/html");
        }

        var successHtml = _htmlResponseService.GenerateSuccessHtml(
            "¡Cuenta Confirmada!",
            "Tu cuenta ha sido confirmada exitosamente. Ahora puedes iniciar sesión.",
            $"{_appSettings.FrontendDomain}");
        return Content(successHtml, "text/html");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var token = await _userService.LoginAsync(dto);
            return Ok(new { token });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("lock")]
    public async Task<IActionResult> Lock([FromBody] LockUserDto dto)
    {
        try
        {
            await _userService.LockUserAsync(dto);
            return Ok(new { message = "Account locked. Check email for unlock instructions." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("unlock")]
    public async Task<IActionResult> Unlock([FromBody] UnlockUserDto dto)
    {
        var success = await _userService.UnlockUserAsync(dto);
        if (!success) return BadRequest(new { error = "Token inválido o expirado" });
        return Ok(new { message = "Cuenta desbloqueada exitosamente" });
    }

    [HttpGet("unlock")]
    public async Task<IActionResult> UnlockFromLink([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            var errorHtml = _htmlResponseService.GenerateErrorHtml(
                "Error de Desbloqueo",
                "No se proporcionó un token válido. Por favor, verifica el enlace en tu correo.");
            return Content(errorHtml, "text/html");
        }

        var dto = new UnlockUserDto { Token = token };
        var success = await _userService.UnlockUserAsync(dto);

        if (!success)
        {
            var errorHtml = _htmlResponseService.GenerateErrorHtml(
                "Error de Desbloqueo",
                "El token es inválido o ha expirado. Por favor, solicita un nuevo enlace de desbloqueo.");
            return Content(errorHtml, "text/html");
        }

        var successHtml = _htmlResponseService.GenerateSuccessHtml(
            "¡Cuenta Desbloqueada!",
            "Tu cuenta ha sido desbloqueada exitosamente. Ahora puedes iniciar sesión.",
            $"{_appSettings.FrontendDomain}");
        return Content(successHtml, "text/html");
    }

    [HttpPost("resend-unlock-code")]
    public async Task<IActionResult> ResendUnlockCode([FromBody] ResendUnlockCodeDto dto)
    {
        try
        {
            await _userService.ResendUnlockCodeAsync(dto);
            return Ok(new { message = "Unlock code sent to your email" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("send-password")]
    public async Task<IActionResult> SendPassword([FromBody] SendPasswordDto dto)
    {
        try
        {
            await _userService.SendPasswordAsync(dto);
            return Ok(new { message = "Se ha enviado tu contraseña a tu correo." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
