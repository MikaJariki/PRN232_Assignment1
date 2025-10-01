using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ProductsApi.Repository;
using ProductsApi.Models;
using ProductsApi.Storage;
using ProductsApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// CORS for FE at localhost:3000
builder.Services.AddCors(options =>
{
    options.AddPolicy("fe",
        p => p.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers();

// Choose storage: PostgreSQL (preferred) or JSON file fallback
var conn = ConnectionHelper.GetPostgresConnectionString(builder.Configuration);
Console.WriteLine($"[Startup] Resolved connection string: {conn}");
if (!string.IsNullOrWhiteSpace(conn))
{
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(conn));
    builder.Services.AddScoped<IProductRepository, EfProductRepository>();
}
else
{
    builder.Services.AddSingleton<IProductRepository>(sp =>
    {
        var env = sp.GetRequiredService<IHostEnvironment>();
        var dataPath = Path.Combine(env.ContentRootPath, "data", "products.json");
        return new FileProductRepository(dataPath);
    });
}

builder.Services.AddScoped<IProductService, ProductService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure DB exists and seed if using EF
if (!string.IsNullOrWhiteSpace(conn))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
}

app.UseCors("fe");
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();
