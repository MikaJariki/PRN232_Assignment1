using System;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProductsApi.Models;
using ProductsApi.Repository;
using ProductsApi.Services;
using ProductsApi.Storage;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

var allowedOriginsSetting = builder.Configuration["AllowedOrigins"] ?? builder.Configuration["Cors:AllowedOrigins"];
var allowedOrigins = string.IsNullOrWhiteSpace(allowedOriginsSetting)
    ? new[] { "http://localhost:3000", "https://localhost:3000" }
    : allowedOriginsSetting.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("fe",
        p => p.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers();

// Choose storage: PostgreSQL (preferred) or JSON file fallback
var conn = ConnectionHelper.GetPostgresConnectionString(builder.Configuration);
Console.WriteLine($"[Startup] Resolved connection string: {conn}");
if (!string.IsNullOrWhiteSpace(conn))
{
    builder.Services.AddDbContext<AppDbContext>(opt =>
    {
        opt.UseNpgsql(conn, npgsql =>
        {
            npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(5), null);
            npgsql.CommandTimeout(60);
        });
    });
    builder.Services.AddScoped<IProductRepository, EfProductRepository>();
}
else
{
    builder.Services.AddDbContext<AppDbContext>(opt =>
    {
        opt.UseInMemoryDatabase("UmaStore");
    });
    builder.Services.AddScoped<IProductRepository, EfProductRepository>();
}

builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<TokenService>();
builder.Services.Configure<StripeOptions>(builder.Configuration.GetSection(StripeOptions.Section));
builder.Services.AddScoped<StripeService>();

var jwtSection = builder.Configuration.GetSection(JwtOptions.Section);
var jwtSecret = jwtSection["Secret"] ?? builder.Configuration["JwtSecret"] ?? "dev-super-secret-change-me";
var jwtIssuer = jwtSection["Issuer"] ?? "ProductsApi";
var jwtAudience = jwtSection["Audience"] ?? "ProductsApiClient";
var jwtExpiry = jwtSection["ExpiryMinutes"];

builder.Services.Configure<JwtOptions>(options =>
{
    options.Secret = jwtSecret;
    options.Issuer = jwtIssuer;
    options.Audience = jwtAudience;
    if (int.TryParse(jwtExpiry, out var minutes) && minutes > 0)
    {
        options.ExpiryMinutes = minutes;
    }
});

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
var validateIssuer = !string.IsNullOrWhiteSpace(jwtIssuer);
var validateAudience = !string.IsNullOrWhiteSpace(jwtAudience);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = validateIssuer,
            ValidIssuer = jwtIssuer,
            ValidateAudience = validateAudience,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure database exists and seed baseline data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetService<AppDbContext>();
    if (db is not null)
    {
        var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();

        if (!string.IsNullOrWhiteSpace(conn))
        {
            var skipMigrate = conn.Contains("pooler", StringComparison.OrdinalIgnoreCase);
            if (!skipMigrate)
            {
                try
                {
                    await db.Database.MigrateAsync();
                }
                catch (Exception ex)
                {
                    app.Logger.LogWarning(ex, "Skipping EF migrations (already applied or unsupported in this environment).");
                }
            }
            else
            {
                app.Logger.LogInformation("Detected pooled connection string, skipping EF migrations.");
            }
        }
        else
        {
            await db.Database.EnsureCreatedAsync();
        }

        if (!env.IsProduction())
        {
            try
            {
                await DbSeeder.SeedAsync(db);
            }
            catch (Exception ex)
            {
                app.Logger.LogWarning(ex, "Skipping data seeding during startup.");
            }
        }
        else
        {
            app.Logger.LogInformation("Skipping data seeding in production environment.");
        }
    }
}

app.UseCors("fe");
app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
