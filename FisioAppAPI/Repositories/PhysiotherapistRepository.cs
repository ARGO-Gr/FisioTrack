using Microsoft.EntityFrameworkCore;
using FisioAppAPI.Data;
using FisioAppAPI.Models;
using FisioAppAPI.Interfaces;

namespace FisioAppAPI.Repositories;

public class PhysiotherapistRepository : IPhysiotherapistRepository
{
    private readonly ApplicationDbContext _db;

    public PhysiotherapistRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(PhysiotherapistProfile profile)
    {
        _db.PhysiotherapistProfiles.Add(profile);
        await _db.SaveChangesAsync();
    }

    public async Task<PhysiotherapistProfile?> GetByIdAsync(Guid id)
    {
        return await _db.PhysiotherapistProfiles.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<PhysiotherapistProfile?> GetByUserIdAsync(Guid userId)
    {
        return await _db.PhysiotherapistProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
    }

    public async Task<PhysiotherapistProfile?> FindByLicenseAsync(string licenseNumber)
    {
        return await _db.PhysiotherapistProfiles
            .FirstOrDefaultAsync(p => p.LicenseNumber.ToLower() == licenseNumber.ToLower());
    }

    public async Task<IEnumerable<PhysiotherapistProfile>> GetAllAsync()
    {
        return await _db.PhysiotherapistProfiles.ToListAsync();
    }

    public async Task<IEnumerable<PhysiotherapistProfile>> GetActiveAsync()
    {
        return await _db.PhysiotherapistProfiles
            .Where(p => p.IsActive)
            .ToListAsync();
    }

    public async Task UpdateAsync(PhysiotherapistProfile profile)
    {
        profile.UpdatedAt = DateTime.UtcNow;
        _db.PhysiotherapistProfiles.Update(profile);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var profile = await GetByIdAsync(id);
        if (profile is not null)
        {
            _db.PhysiotherapistProfiles.Remove(profile);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<PhysiotherapistProfile>> GetBySpecialtyAsync(string specialty)
    {
        return await _db.PhysiotherapistProfiles
            .Where(p => p.Specialties.Contains(specialty) && p.IsActive)
            .ToListAsync();
    }

    public async Task<bool> LicenseExistsAsync(string licenseNumber)
    {
        return await _db.PhysiotherapistProfiles
            .AnyAsync(p => p.LicenseNumber.ToLower() == licenseNumber.ToLower());
    }
}
