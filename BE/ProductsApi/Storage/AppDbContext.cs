using Microsoft.EntityFrameworkCore;
using ProductsApi.Models;

namespace ProductsApi.Storage;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

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

        var user = modelBuilder.Entity<User>();
        user.HasKey(x => x.Id);
        user.Property(x => x.Id).HasMaxLength(64);
        user.Property(x => x.Email).IsRequired().HasMaxLength(256);
        user.HasIndex(x => x.Email).IsUnique();
        user.Property(x => x.PasswordHash).IsRequired().HasMaxLength(512);
        user.Property(x => x.CreatedAt).IsRequired();

        var cart = modelBuilder.Entity<CartItem>();
        cart.HasKey(x => x.Id);
        cart.Property(x => x.Id).HasMaxLength(64);
        cart.Property(x => x.Quantity).IsRequired();
        cart.Property(x => x.CreatedAt).IsRequired();
        cart.Property(x => x.UpdatedAt).IsRequired();
        cart.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
        cart.HasOne(x => x.User)
            .WithMany(u => u.CartItems)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        cart.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        var order = modelBuilder.Entity<Order>();
        order.HasKey(x => x.Id);
        order.Property(x => x.Id).HasMaxLength(64);
        order.Property(x => x.Status).IsRequired().HasMaxLength(32);
        order.Property(x => x.TotalAmount).HasColumnType("numeric(12,2)");
        order.Property(x => x.CreatedAt).IsRequired();
        order.HasOne(x => x.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        var orderItem = modelBuilder.Entity<OrderItem>();
        orderItem.HasKey(x => x.Id);
        orderItem.Property(x => x.Id).HasMaxLength(64);
        orderItem.Property(x => x.Name).IsRequired().HasMaxLength(200);
        orderItem.Property(x => x.Description).IsRequired().HasMaxLength(2000);
        orderItem.Property(x => x.Price).HasColumnType("numeric(12,2)");
        orderItem.Property(x => x.Quantity).IsRequired();
        orderItem.HasOne(x => x.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
