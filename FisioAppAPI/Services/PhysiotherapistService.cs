using BCrypt.Net;
using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FisioAppAPI.Services;

public class PhysiotherapistService : IPhysiotherapistService
{
    private readonly IPhysiotherapistRepository _physioRepo;
    private readonly IUserRepository _userRepo;
    private readonly IEmailSender _emailSender;
    private readonly JwtSettings _jwtSettings;
    private readonly AppSettings _appSettings;

    public PhysiotherapistService(
        IPhysiotherapistRepository physioRepo,
        IUserRepository userRepo,
        IEmailSender emailSender,
        IOptions<JwtSettings> jwtSettings,
        IOptions<AppSettings> appSettings)
    {
        _physioRepo = physioRepo;
        _userRepo = userRepo;
        _emailSender = emailSender;
        _jwtSettings = jwtSettings.Value;
        _appSettings = appSettings.Value;
    }

    public async Task RegisterAsync(RegisterPhysioDto dto)
    {
        // Validar email único
        var existingUser = await _userRepo.FindByEmailAsync(dto.Email);
        if (existingUser is not null)
            throw new InvalidOperationException("El email ya está registrado");

        // Validar licencia única
        var existingLicense = await _physioRepo.FindByLicenseAsync(dto.LicenseNumber);
        if (existingLicense is not null)
            throw new InvalidOperationException("El número de licencia ya existe");

        // Validar año de graduación
        if (dto.GraduationYear > DateTime.Now.Year || dto.GraduationYear < 1950)
            throw new ArgumentException("Año de graduación inválido");

        // Validar especialidades no vacías
        if (dto.Specialties == null || dto.Specialties.Count == 0)
            throw new ArgumentException("Se requiere al menos una especialidad");

        // Crear usuario
        var user = new User
        {
            Email = dto.Email,
            FullName = dto.FullName,
            Telefono = dto.Telefono,
            FechaNacimiento = dto.FechaNacimiento,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IsConfirmed = false
        };

        // Generar token de confirmación
        var confirmationToken = GenerateConfirmationToken(user);
        user.ConfirmationToken = confirmationToken;
        user.ConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(24);

        await _userRepo.AddAsync(user);

        // Crear perfil de fisioterapeuta
        var profile = new PhysiotherapistProfile
        {
            UserId = user.Id,
            LicenseNumber = dto.LicenseNumber,
            LicenseAuthority = dto.LicenseAuthority,
            Specialties = string.Join("|", dto.Specialties),
            GraduationYear = dto.GraduationYear,
            IsActive = true
        };

        await _physioRepo.AddAsync(profile);

        // Enviar email con enlace de confirmación
        var confirmationLink = $"{_appSettings.AppDomain}/api/auth/confirm?token={Uri.EscapeDataString(confirmationToken)}";

        var subject = "Confirmación de Registro - Fisioterapeuta";
        var body = $"Bienvenido {dto.FullName},<br/>" +
                   $"Haz clic en el siguiente enlace para confirmar tu cuenta:<br/>" +
                   $"<a href=\"{confirmationLink}\">Confirmar cuenta</a><br/>" +
                   $"Este enlace expira en 24 horas.";

        await _emailSender.SendAsync(user.Email, subject, body);
    }

    public async Task<PhysioProfileDto> GetByIdAsync(Guid id)
    {
        var profile = await _physioRepo.GetByIdAsync(id);
        if (profile is null)
            throw new KeyNotFoundException("Perfil de fisioterapeuta no encontrado");

        return await MapToPhysioProfileDto(profile);
    }

    public async Task<PhysioProfileDto> GetByUserIdAsync(Guid userId)
    {
        var profile = await _physioRepo.GetByUserIdAsync(userId);
        if (profile is null)
            throw new KeyNotFoundException("Perfil de fisioterapeuta no encontrado");

        return await MapToPhysioProfileDto(profile);
    }

    public async Task<List<PhysioListItemDto>> GetAllAsync()
    {
        var profiles = await _physioRepo.GetActiveAsync();
        return profiles.Select(MapToPhysioListItemDto).ToList();
    }

    public async Task<PhysioProfileDto> UpdateAsync(Guid userId, UpdatePhysioDto dto)
    {
        var profile = await _physioRepo.GetByUserIdAsync(userId);
        if (profile is null)
            throw new KeyNotFoundException("Perfil de fisioterapeuta no encontrado");

        var user = await _userRepo.FindByIdAsync(userId);
        if (user is null)
            throw new KeyNotFoundException("Usuario asociado no encontrado");
        
        // Actualizar campos permitidos
        if (!string.IsNullOrEmpty(dto.FullName))
        {
            user.FullName = dto.FullName;
            await _userRepo.UpdateAsync(user);
        }

        if (dto.Specialties != null && dto.Specialties.Count > 0)
        {
            profile.Specialties = string.Join("|", dto.Specialties);
        }

        profile.UpdatedAt = DateTime.UtcNow;
        await _physioRepo.UpdateAsync(profile);

        return await MapToPhysioProfileDto(profile);
    }

    public async Task<bool> DeactivateAsync(Guid userId)
    {
        var profile = await _physioRepo.GetByUserIdAsync(userId);
        if (profile is null)
            return false;

        profile.IsActive = false;
        profile.UpdatedAt = DateTime.UtcNow;
        await _physioRepo.UpdateAsync(profile);
        return true;
    }

    public async Task<List<PhysioListItemDto>> GetBySpecialtyAsync(string specialty)
    {
        var profiles = await _physioRepo.GetBySpecialtyAsync(specialty);
        return profiles.Select(MapToPhysioListItemDto).ToList();
    }

    private async Task<PhysioProfileDto> MapToPhysioProfileDto(PhysiotherapistProfile profile)
    {
        var user = await _userRepo.FindByIdAsync(profile.UserId);
        
        return new PhysioProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            Email = user?.Email ?? string.Empty,
            FullName = user?.FullName ?? string.Empty,
            LicenseNumber = profile.LicenseNumber,
            LicenseAuthority = profile.LicenseAuthority,
            Specialties = profile.Specialties.Split('|').ToList(),
            GraduationYear = profile.GraduationYear,
            IsActive = profile.IsActive,
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };
    }

    private PhysioListItemDto MapToPhysioListItemDto(PhysiotherapistProfile profile)
    {
        return new PhysioListItemDto
        {
            Id = profile.Id,
            FullName = "", // TODO: Obtener de User con query separada si es necesario
            Specialties = profile.Specialties.Split('|').ToList(),
            IsActive = profile.IsActive,
            LicenseNumber = profile.LicenseNumber
        };
    }

    private string GenerateConfirmationToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
