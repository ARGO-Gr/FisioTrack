using FisioAppAPI.Models;

namespace FisioAppAPI.Interfaces;

public interface IUserRepository
{
    Task AddAsync(User user);
    Task<User?> FindByEmailAsync(string email);
    Task<User?> FindByIdAsync(Guid id);
    Task UpdateAsync(User user);
    Task<List<User>> SearchUsersByNameOrEmailAsync(string searchTerm);
}
