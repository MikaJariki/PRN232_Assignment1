using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductsApi.Models;
using ProductsApi.Services;

namespace ProductsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await authService.RegisterAsync(request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ToRegisterMessage(ex.Message) });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await authService.LoginAsync(request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ToLoginMessage(ex.Message) });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserSummary>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var user = await authService.GetCurrentAsync(userId);
        return user is null ? NotFound() : Ok(user);
    }

    private static string ToRegisterMessage(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "Unable to create account. Please try again.";
        if (raw.Contains("already registered", StringComparison.OrdinalIgnoreCase))
            return "This email address is already registered.";
        if (raw.Contains("at least 6 characters", StringComparison.OrdinalIgnoreCase))
            return "Password must be at least 6 characters long.";
        if (raw.Contains("Email is required", StringComparison.OrdinalIgnoreCase))
            return "Email is required.";
        if (raw.Contains("Password", StringComparison.OrdinalIgnoreCase))
            return raw;
        return "Unable to create account. Please check the details and try again.";
    }

    private static string ToLoginMessage(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "Invalid email or password.";
        if (raw.Contains("invalid credentials", StringComparison.OrdinalIgnoreCase))
            return "Invalid email or password.";
        return "Unable to sign in. Please check your email and password.";
    }
}
