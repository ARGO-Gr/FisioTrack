using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FisioAppAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IPaymentCardService _paymentCardService;
    private readonly IPhysiotherapistRepository _physioRepository;

    public UsersController(IUserService userService, IPaymentCardService paymentCardService, IPhysiotherapistRepository physioRepository)
    {
        _userService = userService;
        _paymentCardService = paymentCardService;
        _physioRepository = physioRepository;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("User ID not found in claims"));

        var profile = await _userService.GetUserProfileAsync(userId);
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateUserProfileDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("User ID not found in claims"));

        var profile = await _userService.UpdateUserProfileAsync(userId, dto);
        return Ok(profile);
    }

    // Payment Cards endpoints
    [HttpGet("payment-cards")]
    public async Task<ActionResult<List<PaymentCardDto>>> GetPaymentCards()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("User ID not found in claims"));

        var cards = await _paymentCardService.GetUserPaymentCardsAsync(userId);
        return Ok(cards);
    }

    [HttpPost("payment-cards")]
    public async Task<ActionResult<PaymentCardDto>> AddPaymentCard([FromBody] CreatePaymentCardDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("User ID not found in claims"));

        var card = await _paymentCardService.AddPaymentCardAsync(userId, dto);
        return CreatedAtAction(nameof(GetPaymentCards), card);
    }

    [HttpPut("payment-cards/{cardId}/set-default")]
    public async Task<ActionResult<PaymentCardDto>> SetDefaultPaymentCard(Guid cardId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("User ID not found in claims"));

        var card = await _paymentCardService.SetDefaultPaymentCardAsync(userId, cardId);
        return Ok(card);
    }

    [HttpDelete("payment-cards/{cardId}")]
    public async Task<IActionResult> DeletePaymentCard(Guid cardId)
    {
        await _paymentCardService.DeletePaymentCardAsync(cardId);
        return NoContent();
    }

    [HttpGet("physiotherapist-profile")]
    public async Task<ActionResult<PhysiotherapistProfileDto>> GetPhysiotherapistProfile()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("User ID not found in claims"));

        var profile = await _physioRepository.GetByUserIdAsync(userId);
        
        if (profile == null)
            return NotFound(new { message = "Physiotherapist profile not found" });

        var dto = new PhysiotherapistProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            LicenseNumber = profile.LicenseNumber,
            LicenseAuthority = profile.LicenseAuthority,
            Specialties = profile.Specialties,
            GraduationYear = profile.GraduationYear,
            IsActive = profile.IsActive,
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };

        return Ok(dto);
    }
}
