using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FisioAppAPI.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IPhysiotherapistRepository _physioRepo;
    private readonly IEmailSender _emailSender;
    private readonly JwtSettings _jwtSettings;
    private readonly AppSettings _appSettings;

    public UserService(
        IUserRepository repo,
        IPhysiotherapistRepository physioRepo,
        IEmailSender emailSender,
        IOptions<JwtSettings> jwtSettings,
        IOptions<AppSettings> appSettings)
    {
        _repo = repo;
        _physioRepo = physioRepo;
        _emailSender = emailSender;
        _jwtSettings = jwtSettings.Value;
        _appSettings = appSettings.Value;
    }

    public async Task RegisterAsync(RegisterDto dto)
    {
        var existing = await _repo.FindByEmailAsync(dto.Email);
        if (existing is not null)
            throw new InvalidOperationException("User already exists");

        var user = new User
        {
            Email = dto.Email,
            FullName = dto.FullName,
            Telefono = dto.Telefono,
            FechaNacimiento = dto.FechaNacimiento,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IsConfirmed = false
        };

        // Generate confirmation token (expires in 24 hours)
        var confirmationToken = GenerateConfirmationToken(user);
        user.ConfirmationToken = confirmationToken;
        user.ConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(24);

        await _repo.AddAsync(user);

        // Build confirmation link
        var confirmationLink = $"{_appSettings.AppDomain}/api/auth/confirm?token={Uri.EscapeDataString(confirmationToken)}";

        var subject = "Confirmación de registro";
        var body = $"Bienvenido,<br/>" +
                   $"Haz clic en el siguiente enlace para confirmar tu cuenta:<br/>" +
                   $"<a href=\"{confirmationLink}\">Confirmar cuenta</a><br/>" +
                   $"Este enlace expira en 24 horas.";

        await _emailSender.SendAsync(user.Email, subject, body);
    }

    public async Task<bool> ConfirmAsync(ConfirmDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token))
            return false;

        // Validate the confirmation token
        var principal = ValidateConfirmationToken(dto.Token);
        if (principal is null)
            return false;

        var emailClaim = principal.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrWhiteSpace(emailClaim))
            return false;

        var user = await _repo.FindByEmailAsync(emailClaim);
        if (user is null)
            return false;

        if (user.IsConfirmed)
            return true;

        if (user.ConfirmationToken is null)
            return false;

        if (user.ConfirmationTokenExpiresAt is null || user.ConfirmationTokenExpiresAt < DateTime.UtcNow)
            return false;

        // Tokens must match
        if (user.ConfirmationToken != dto.Token)
            return false;

        user.IsConfirmed = true;
        user.ConfirmationToken = null;
        user.ConfirmationTokenExpiresAt = null;

        await _repo.UpdateAsync(user);
        return true;
    }

    public async Task<string> LoginAsync(LoginDto dto)
    {
        var user = await _repo.FindByEmailAsync(dto.Email);
        if (user is null)
            throw new InvalidOperationException("Credenciales invalidas");

        if (!user.IsConfirmed)
            throw new InvalidOperationException("Porfavor confirma primero tu email");

        if (user.IsLocked)
            throw new InvalidOperationException("Cuenta bloqueada, revisa tu email por indicaciones");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;
            user.LastFailedLoginAttempt = DateTime.UtcNow;

            if (user.FailedLoginAttempts >= 3)
            {
                await LockUserAsync(new LockUserDto { Email = user.Email });
                throw new InvalidOperationException("Account has been locked due to multiple failed attempts. Check your email for unlock instructions.");
            }

            await _repo.UpdateAsync(user);
            throw new InvalidOperationException("Credenciales invalidas");
        }

        // Validar si es fisioterapeuta y está activo
        var physio = await _physioRepo.GetByUserIdAsync(user.Id);
        if (physio != null && !physio.IsActive)
            throw new InvalidOperationException("Physiotherapist profile is not active");

        // Reset failed attempts on successful login
        user.FailedLoginAttempts = 0;
        user.LastFailedLoginAttempt = null;
        await _repo.UpdateAsync(user);

        return GenerateJwtToken(user, physio);
    }

    public async Task LockUserAsync(LockUserDto dto)
    {
        var user = await _repo.FindByEmailAsync(dto.Email);
        if (user is null)
            throw new InvalidOperationException("User not found");

        // Generate unlock token (expires in 24 hours)
        var unlockToken = GenerateUnlockToken(user);
        user.UnlockCode = unlockToken;
        user.UnlockCodeExpiresAt = DateTime.UtcNow.AddHours(24);
        user.IsLocked = true;

        await _repo.UpdateAsync(user);

        // Build unlock link
        var unlockLink = $"{_appSettings.AppDomain}/api/auth/unlock?token={Uri.EscapeDataString(unlockToken)}";

        // Send email with unlock link
        var subject = "Cuenta Bloqueada - Instrucciones de Desbloqueo";
        var body = $"Tu cuenta ha sido bloqueada por múltiples intentos de inicio de sesión fallidos.<br/>" +
                   $"Haz clic en el siguiente enlace para desbloquear tu cuenta:<br/>" +
                   $"<a href=\"{unlockLink}\">Desbloquear cuenta</a><br/>" +
                   $"Este enlace expira en 24 horas.";

        await _emailSender.SendAsync(user.Email, subject, body);
    }

    public async Task<bool> UnlockUserAsync(UnlockUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token))
            return false;

        // Validate the unlock token
        var principal = ValidateUnlockToken(dto.Token);
        if (principal is null)
            return false;

        var emailClaim = principal.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrWhiteSpace(emailClaim))
            return false;

        var user = await _repo.FindByEmailAsync(emailClaim);
        if (user is null) 
            return false;

        if (!user.IsLocked) 
            return true;

        if (user.UnlockCode is null) 
            return false;

        if (user.UnlockCodeExpiresAt is null || user.UnlockCodeExpiresAt < DateTime.UtcNow) 
            return false;

        // Tokens must match
        if (user.UnlockCode != dto.Token) 
            return false;

        user.IsLocked = false;
        user.UnlockCode = null;
        user.UnlockCodeExpiresAt = null;
        user.FailedLoginAttempts = 0;
        user.LastFailedLoginAttempt = null;

        await _repo.UpdateAsync(user);
        return true;
    }

    public async Task ResendUnlockCodeAsync(ResendUnlockCodeDto dto)
    {
        var user = await _repo.FindByEmailAsync(dto.Email);
        if (user is null)
            throw new InvalidOperationException("User not found");

        if (!user.IsLocked)
            throw new InvalidOperationException("Account is not locked");

        // Generate new unlock token
        var unlockToken = GenerateUnlockToken(user);
        user.UnlockCode = unlockToken;
        user.UnlockCodeExpiresAt = DateTime.UtcNow.AddHours(24);

        await _repo.UpdateAsync(user);

        // Build unlock link
        var unlockLink = $"{_appSettings.AppDomain}/api/auth/unlock?token={Uri.EscapeDataString(unlockToken)}";

        // Send email with new unlock link
        var subject = "Nuevo Enlace de Desbloqueo - Recuperación de Cuenta";
        var body = $"Has solicitado un nuevo enlace de desbloqueo para tu cuenta.<br/>" +
                   $"Haz clic en el siguiente enlace para desbloquear tu cuenta:<br/>" +
                   $"<a href=\"{unlockLink}\">Desbloquear cuenta</a><br/>" +
                   $"Este enlace expira en 24 horas.";

        await _emailSender.SendAsync(user.Email, subject, body);
    }

    public async Task SendPasswordAsync(SendPasswordDto dto)
    {
        var user = await _repo.FindByEmailAsync(dto.Email);
        if (user is null)
            throw new InvalidOperationException("Usuario no encontrado");

        // Generate a temporary password (8 characters: uppercase, lowercase, numbers, special chars)
        var temporaryPassword = GenerateTemporaryPassword();
        
        // Hash the temporary password and update it in the database
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword);
        await _repo.UpdateAsync(user);

        // Send email with temporary password
        var subject = "Tu Contraseña Temporal";
        var body = $"Hola {user.FullName ?? user.Email},<br/><br/>" +
                   $"Has solicitado que se envíe tu contraseña. Aquí está tu contraseña temporal:<br/><br/>" +
                   $"<strong>Contraseña Temporal:</strong> {temporaryPassword}<br/><br/>" +
                   $"Te recomendamos cambiar esta contraseña después de tu próximo inicio de sesión.<br/>" +
                   $"Por favor, no compartas esta información con nadie.<br/><br/>" +
                   $"Si no solicitaste este cambio, puedes ignorar este correo.";

        await _emailSender.SendAsync(user.Email, subject, body);
    }

    private string GenerateTemporaryPassword()
    {
        const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lowercase = "abcdefghijklmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string specialChars = "!@#$%^&*";
        const string allChars = uppercase + lowercase + digits + specialChars;

        var random = new Random();
        var password = new StringBuilder();

        // Ensure at least one character from each category
        password.Append(uppercase[random.Next(uppercase.Length)]);
        password.Append(lowercase[random.Next(lowercase.Length)]);
        password.Append(digits[random.Next(digits.Length)]);
        password.Append(specialChars[random.Next(specialChars.Length)]);

        // Fill the rest randomly
        for (int i = password.Length; i < 12; i++)
        {
            password.Append(allChars[random.Next(allChars.Length)]);
        }

        // Shuffle the password
        var chars = password.ToString().ToCharArray();
        for (int i = chars.Length - 1; i > 0; i--)
        {
            int randomIndex = random.Next(i + 1);
            (chars[i], chars[randomIndex]) = (chars[randomIndex], chars[i]);
        }

        return new string(chars);
    }

    private string GenerateJwtToken(User user, Models.PhysiotherapistProfile? physio = null)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.FullName ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Agregar role claim basado en si es fisioterapeuta
        if (physio != null)
        {
            claims.Add(new Claim("role", "physiotherapist"));
            claims.Add(new Claim("physiotherapist_id", physio.Id.ToString()));
        }
        else
        {
            claims.Add(new Claim("role", "patient"));
        }

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.DurationInMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
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

    private string GenerateUnlockToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("type", "unlock"),
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

    private ClaimsPrincipal? ValidateConfirmationToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.Key);

            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return principal;
        }
        catch
        {
            return null;
        }
    }

    private ClaimsPrincipal? ValidateUnlockToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.Key);

            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _repo.FindByEmailAsync(email);
    }

    public async Task UpdateUserAsync(User user)
    {
        await _repo.UpdateAsync(user);
    }

    public async Task<UserProfileDto> GetUserProfileAsync(Guid userId)
    {
        var user = await _repo.FindByIdAsync(userId);
        if (user is null)
            throw new InvalidOperationException("User not found");

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Telefono = user.Telefono,
            FechaNacimiento = user.FechaNacimiento
        };
    }

    public async Task<UserProfileDto> UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto dto)
    {
        var user = await _repo.FindByIdAsync(userId);
        if (user is null)
            throw new InvalidOperationException("User not found");

        user.FullName = dto.FullName ?? user.FullName;
        user.Telefono = dto.Telefono ?? user.Telefono;
        user.FechaNacimiento = dto.FechaNacimiento ?? user.FechaNacimiento;

        await _repo.UpdateAsync(user);

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Telefono = user.Telefono,
            FechaNacimiento = user.FechaNacimiento
        };
    }
}