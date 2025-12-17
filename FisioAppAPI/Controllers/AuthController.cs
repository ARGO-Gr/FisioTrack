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

    // ENDPOINT TEMPORAL PARA CREAR USUARIOS DE PRUEBA
    [HttpPost("seed-test-users")]
    public async Task<IActionResult> SeedTestUsers()
    {
        try
        {
            var testUsers = new List<RegisterDto>
            {
                new RegisterDto
                {
                    FullName = "Dr. Juan Pérez",
                    Email = "juan.perez@fisiotrack.com",
                    Password = "Fisio123!",
                    Telefono = "555-0101",
                    FechaNacimiento = new DateTime(1980, 5, 15)
                },
                new RegisterDto
                {
                    FullName = "Dra. María González",
                    Email = "maria.gonzalez@fisiotrack.com",
                    Password = "Fisio123!",
                    Telefono = "555-0102",
                    FechaNacimiento = new DateTime(1985, 8, 20)
                },
                new RegisterDto
                {
                    FullName = "Carlos Ramírez",
                    Email = "carlos.ramirez@email.com",
                    Password = "Paciente123!",
                    Telefono = "555-0201",
                    FechaNacimiento = new DateTime(1990, 3, 10)
                },
                new RegisterDto
                {
                    FullName = "Ana Martínez",
                    Email = "ana.martinez@email.com",
                    Password = "Paciente123!",
                    Telefono = "555-0202",
                    FechaNacimiento = new DateTime(1992, 7, 25)
                },
                new RegisterDto
                {
                    FullName = "Luis Torres",
                    Email = "luis.torres@email.com",
                    Password = "Paciente123!",
                    Telefono = "555-0203",
                    FechaNacimiento = new DateTime(1988, 11, 5)
                },
                new RegisterDto
                {
                    FullName = "Laura Sánchez",
                    Email = "laura.sanchez@email.com",
                    Password = "Paciente123!",
                    Telefono = "555-0204",
                    FechaNacimiento = new DateTime(1995, 2, 18)
                }
            };

            var createdUsers = new List<object>();

            foreach (var userDto in testUsers)
            {
                try
                {
                    await _userService.RegisterAsync(userDto);
                    // Auto-confirmar el usuario (SOLO PARA TESTING)
                    var user = await _userService.GetUserByEmailAsync(userDto.Email);
                    if (user != null)
                    {
                        user.IsConfirmed = true;
                        user.ConfirmationToken = null;
                        await _userService.UpdateUserAsync(user);
                        createdUsers.Add(new { 
                            fullName = user.FullName, 
                            email = user.Email,
                            password = userDto.Password
                        });
                    }
                }
                catch (InvalidOperationException)
                {
                    // Usuario ya existe, continuar
                    continue;
                }
            }

            return Ok(new { 
                message = $"Se crearon {createdUsers.Count} usuarios de prueba", 
                users = createdUsers 
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
