using FisioAppAPI.Models;

namespace FisioAppAPI.Interfaces;

public interface IPhysiotherapistRepository
{
    Task AddAsync(PhysiotherapistProfile profile);
    Task<PhysiotherapistProfile?> GetByIdAsync(Guid id);
    Task<PhysiotherapistProfile?> GetByUserIdAsync(Guid userId);
    Task<PhysiotherapistProfile?> FindByLicenseAsync(string licenseNumber);
    Task<IEnumerable<PhysiotherapistProfile>> GetAllAsync();
    Task<IEnumerable<PhysiotherapistProfile>> GetActiveAsync();
    Task UpdateAsync(PhysiotherapistProfile profile);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<PhysiotherapistProfile>> GetBySpecialtyAsync(string specialty);
    Task<bool> LicenseExistsAsync(string licenseNumber);
}
