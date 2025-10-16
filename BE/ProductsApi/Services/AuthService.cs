using System.Net.Mail;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProductsApi.Models;
using ProductsApi.Storage;

namespace ProductsApi.Services;

public class AuthService(AppDbContext db, TokenService tokenService) : IAuthService
{
    private readonly PasswordHasher<User> _hasher = new();

    public async Task<AuthResponse> RegisterAsync(RegisterRequest input)
    {
        var email = NormalizeEmail(input.Email);
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required");
        if (string.IsNullOrWhiteSpace(input.Password) || input.Password.Length < 6)
            throw new ArgumentException("Password must be at least 6 characters");

        if (await db.Users.AnyAsync(u => u.Email == email))
            throw new ArgumentException("Email is already registered");

        var user = new User
        {
            Id = Guid.NewGuid().ToString("n"),
            Email = email,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = _hasher.HashPassword(user, input.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest input)
    {
        var email = NormalizeEmail(input.Email);
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(input.Password))
            throw new ArgumentException("Email and password are required");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
            throw new ArgumentException("Invalid credentials");

        var verification = _hasher.VerifyHashedPassword(user, user.PasswordHash, input.Password);
        if (verification == PasswordVerificationResult.Failed)
            throw new ArgumentException("Invalid credentials");

        return BuildAuthResponse(user);
    }

    public async Task<UserSummary?> GetCurrentAsync(string userId)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        return user is null ? null : ToSummary(user);
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        var token = tokenService.CreateToken(user);
        return new AuthResponse
        {
            Token = token,
            User = ToSummary(user)
        };
    }

    private static UserSummary ToSummary(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        CreatedAt = user.CreatedAt
    };

    private static string NormalizeEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return string.Empty;
        try
        {
            var addr = new MailAddress(email.Trim());
            return addr.Address.ToLowerInvariant();
        }
        catch
        {
            return string.Empty;
        }
    }
}
