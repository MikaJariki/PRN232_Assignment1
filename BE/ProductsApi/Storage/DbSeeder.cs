using Microsoft.EntityFrameworkCore;
using ProductsApi.Models;

namespace ProductsApi.Storage;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Products.AnyAsync()) return;

        var now = DateTime.UtcNow;
        var seed = new[]
        {
            new Product { Id = Guid.NewGuid().ToString("n"), Name = "Classic White Tee", Description = "100% cotton, comfy everyday wear.", Price = 12.99m, Image = "https://picsum.photos/id/100/800/800", CreatedAt = now, UpdatedAt = now },
            new Product { Id = Guid.NewGuid().ToString("n"), Name = "Denim Jacket", Description = "Light wash, unisex fit.", Price = 49.50m, Image = "https://picsum.photos/id/1011/800/800", CreatedAt = now, UpdatedAt = now },
            new Product { Id = Guid.NewGuid().ToString("n"), Name = "Black Hoodie", Description = "Fleece-lined with kangaroo pocket.", Price = 35.00m, Image = "https://picsum.photos/id/1012/800/800", CreatedAt = now, UpdatedAt = now },
            new Product { Id = Guid.NewGuid().ToString("n"), Name = "Running Shorts", Description = "Breathable, quick-dry fabric.", Price = 19.99m, Image = "https://picsum.photos/id/1019/800/800", CreatedAt = now, UpdatedAt = now },
            new Product { Id = Guid.NewGuid().ToString("n"), Name = "Summer Dress", Description = "Floral print A-line.", Price = 29.90m, Image = "https://picsum.photos/id/1027/800/800", CreatedAt = now, UpdatedAt = now },
            new Product { Id = Guid.NewGuid().ToString("n"), Name = "Leather Belt", Description = "Genuine leather, adjustable.", Price = 15.00m, Image = "https://picsum.photos/id/1062/800/800", CreatedAt = now, UpdatedAt = now },
            new Product { Id = Guid.NewGuid().ToString("n"), Name = "Sport Sneakers", Description = "Lightweight, everyday sneakers.", Price = 59.00m, Image = "https://picsum.photos/id/1084/800/800", CreatedAt = now, UpdatedAt = now },
            new Product { Id = Guid.NewGuid().ToString("n"), Name = "Beanie", Description = "Warm knit beanie.", Price = 9.90m, Image = "https://picsum.photos/id/839/800/800", CreatedAt = now, UpdatedAt = now }
        };

        await db.Products.AddRangeAsync(seed);
        await db.SaveChangesAsync();
    }
}

