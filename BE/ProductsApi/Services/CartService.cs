using Microsoft.EntityFrameworkCore;
using ProductsApi.Models;
using ProductsApi.Storage;

namespace ProductsApi.Services;

public class CartService(AppDbContext db) : ICartService
{
    public Task<CartResponse> ListAsync(string userId) => BuildResponse(userId);

    public async Task<CartResponse> AddOrUpdateAsync(string userId, UpdateCartItemRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ProductId))
            throw new ArgumentException("ProductId is required");
        if (request.Quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId);
        if (product is null)
            throw new ArgumentException("Product not found");

        var item = await db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == request.ProductId);
        var now = DateTime.UtcNow;
        if (item is null)
        {
            db.CartItems.Add(new CartItem
            {
                Id = Guid.NewGuid().ToString("n"),
                UserId = userId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else
        {
            item.Quantity += request.Quantity;
            item.UpdatedAt = now;
        }

        await db.SaveChangesAsync();
        return await BuildResponse(userId);
    }

    public async Task<CartResponse> UpdateQuantityAsync(string userId, string cartItemId, int quantity)
    {
        var item = await db.CartItems.FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId);
        if (item is null)
            throw new ArgumentException("Cart item not found");

        if (quantity <= 0)
        {
            db.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = quantity;
            item.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        return await BuildResponse(userId);
    }

    public async Task<CartResponse> RemoveAsync(string userId, string cartItemId)
    {
        var item = await db.CartItems.FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId);
        if (item is null)
            throw new ArgumentException("Cart item not found");

        db.CartItems.Remove(item);
        await db.SaveChangesAsync();
        return await BuildResponse(userId);
    }

    public async Task<CartResponse> ClearAsync(string userId)
    {
        var items = await db.CartItems.Where(c => c.UserId == userId).ToListAsync();
        if (items.Count > 0)
        {
            db.CartItems.RemoveRange(items);
            await db.SaveChangesAsync();
        }
        return await BuildResponse(userId);
    }

    private async Task<CartResponse> BuildResponse(string userId)
    {
        var items = await db.CartItems
            .AsNoTracking()
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CartItemDto
            {
                Id = c.Id,
                ProductId = c.ProductId,
                Name = c.Product.Name,
                Description = c.Product.Description,
                Price = c.Product.Price,
                Image = c.Product.Image,
                Quantity = c.Quantity,
                LineTotal = c.Product.Price * c.Quantity
            })
            .ToListAsync();

        var total = items.Sum(i => i.LineTotal);
        return new CartResponse
        {
            Items = items,
            Total = total
        };
    }
}
