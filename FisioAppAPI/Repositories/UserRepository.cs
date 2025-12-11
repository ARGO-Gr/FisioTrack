using Microsoft.EntityFrameworkCore;
using FisioAppAPI.Data;
using FisioAppAPI.Models;

namespace FisioAppAPI.Repositories;

public class UserRepository : FisioAppAPI.Interfaces.IUserRepository
{
    private readonly ApplicationDbContext _db;

    public UserRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> FindByIdAsync(Guid id)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task UpdateAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task<List<User>> SearchUsersByNameOrEmailAsync(string searchTerm)
    {
        var lowerSearchTerm = searchTerm.ToLower();
        return await _db.Users
            .Where(u => u.Email.ToLower().Contains(lowerSearchTerm) ||
                       (u.FullName != null && u.FullName.ToLower().Contains(lowerSearchTerm)))
            .ToListAsync();
    }
}
