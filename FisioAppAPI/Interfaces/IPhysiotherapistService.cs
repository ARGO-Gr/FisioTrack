using FisioAppAPI.DTOs;

namespace FisioAppAPI.Interfaces;

public interface IPhysiotherapistService
{
    Task RegisterAsync(RegisterPhysioDto dto);
    Task<PhysioProfileDto> GetByIdAsync(Guid id);
    Task<PhysioProfileDto> GetByUserIdAsync(Guid userId);
    Task<List<PhysioListItemDto>> GetAllAsync();
    Task<PhysioProfileDto> UpdateAsync(Guid userId, UpdatePhysioDto dto);
    Task<bool> DeactivateAsync(Guid userId);
    Task<List<PhysioListItemDto>> GetBySpecialtyAsync(string specialty);
}
