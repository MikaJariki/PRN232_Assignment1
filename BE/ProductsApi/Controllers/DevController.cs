using Microsoft.AspNetCore.Mvc;
using ProductsApi.Storage;

namespace ProductsApi.Controllers;

[ApiController]
[Route("api/dev")] 
public class DevController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly AppDbContext? _db;

    public DevController(IWebHostEnvironment env, IServiceProvider sp)
    {
        _env = env;
        _db = sp.GetService<AppDbContext>();
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset()
    {
        if (!_env.IsDevelopment()) return Forbid();
        if (_db is null) return NotFound(new { message = "No database configured" });
        _db.Products.RemoveRange(_db.Products);
        await _db.SaveChangesAsync();
        await DbSeeder.SeedAsync(_db);
        return Ok(new { status = "reset" });
    }
}

