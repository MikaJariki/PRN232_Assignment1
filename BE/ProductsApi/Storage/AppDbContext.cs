using Microsoft.EntityFrameworkCore;
using ProductsApi.Models;

namespace ProductsApi.Storage;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var p = modelBuilder.Entity<Product>();
        p.HasKey(x => x.Id);
        p.Property(x => x.Id).HasMaxLength(64);
        p.Property(x => x.Name).IsRequired().HasMaxLength(200);
        p.Property(x => x.Description).IsRequired().HasMaxLength(2000);
        p.Property(x => x.Price).HasColumnType("numeric(12,2)");
        p.Property(x => x.Image).HasMaxLength(1024);
        p.Property(x => x.CreatedAt).IsRequired();
        p.Property(x => x.UpdatedAt).IsRequired();
    }
}

