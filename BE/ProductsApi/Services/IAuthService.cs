using ProductsApi.Models;

namespace ProductsApi.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest input);
    Task<AuthResponse> LoginAsync(LoginRequest input);
    Task<UserSummary?> GetCurrentAsync(string userId);
}
