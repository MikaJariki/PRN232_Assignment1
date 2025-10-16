namespace ProductsApi.Models;

public class User
{
    public string Id { get; set; } = default!;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public required string Token { get; init; }
    public required UserSummary User { get; init; }
}

public class UserSummary
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public required DateTime CreatedAt { get; init; }
}
