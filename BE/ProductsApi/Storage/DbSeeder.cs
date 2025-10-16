using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProductsApi.Models;

namespace ProductsApi.Storage;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        var now = DateTime.UtcNow;

        if (!await db.Products.AnyAsync())
        {
            var products = new[]
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

            await db.Products.AddRangeAsync(products);
            await db.SaveChangesAsync();
        }

        if (!await db.Users.AnyAsync())
        {
            var hasher = new PasswordHasher<User>();
            var demo = new User
            {
                Id = Guid.NewGuid().ToString("n"),
                Email = "demo@uma.store",
                CreatedAt = now
            };
            demo.PasswordHash = hasher.HashPassword(demo, "Password123!");
            await db.Users.AddAsync(demo);
            await db.SaveChangesAsync();
        }

        if (!await db.Orders.AnyAsync())
        {
            var user = await db.Users.FirstAsync();
            var product = await db.Products.FirstAsync();
            var orderId = Guid.NewGuid().ToString("n");
            var order = new Order
            {
                Id = orderId,
                UserId = user.Id,
                CreatedAt = now,
                Status = "paid",
                TotalAmount = product.Price,
                PaidAt = now,
                Items = new List<OrderItem>
                {
                    new()
                    {
                        Id = Guid.NewGuid().ToString("n"),
                        OrderId = orderId,
                        ProductId = product.Id,
                        Name = product.Name,
                        Description = product.Description,
                        Price = product.Price,
                        Quantity = 1
                    }
                }
            };

            await db.Orders.AddAsync(order);
            await db.SaveChangesAsync();
        }
    }
}
