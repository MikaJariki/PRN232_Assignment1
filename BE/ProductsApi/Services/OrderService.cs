using Microsoft.EntityFrameworkCore;
using ProductsApi.Models;
using ProductsApi.Storage;

namespace ProductsApi.Services;

public class OrderService(AppDbContext db) : IOrderService
{
    public async Task<OrderDetails> CheckoutAsync(string userId, bool markPaid)
    {
        var cartItems = await db.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (cartItems.Count == 0)
            throw new ArgumentException("Cart is empty");

        var now = DateTime.UtcNow;
        var total = cartItems.Sum(c => c.Product.Price * c.Quantity);
        var orderId = Guid.NewGuid().ToString("n");

        var order = new Order
        {
            Id = orderId,
            UserId = userId,
            CreatedAt = now,
            TotalAmount = total,
            Status = markPaid ? "paid" : "pending",
            PaidAt = markPaid ? now : null,
            Items = cartItems.Select(c => new OrderItem
            {
                Id = Guid.NewGuid().ToString("n"),
                OrderId = orderId,
                ProductId = c.ProductId,
                Name = c.Product.Name,
                Description = c.Product.Description,
                Price = c.Product.Price,
                Quantity = c.Quantity
            }).ToList()
        };
        db.Orders.Add(order);
        db.CartItems.RemoveRange(cartItems);
        await db.SaveChangesAsync();

        return ToDetails(order);
    }

    public async Task<IReadOnlyList<OrderSummary>> ListAsync(string userId)
    {
        var orders = await db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummary
            {
                Id = o.Id,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        return orders;
    }

    public async Task<OrderDetails?> GetAsync(string userId, string orderId)
    {
        var order = await db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        return order is null ? null : ToDetails(order);
    }

    public async Task<OrderDetails?> MarkPaidAsync(string userId, string orderId)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        if (order is null) return null;

        order.Status = "paid";
        order.PaidAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return ToDetails(order);
    }

    private static OrderDetails ToDetails(Order order) => new()
    {
        Id = order.Id,
        TotalAmount = order.TotalAmount,
        Status = order.Status,
        CreatedAt = order.CreatedAt,
        PaidAt = order.PaidAt,
        Items = order.Items.Select(i => new OrderLineDetails
        {
            ProductId = i.ProductId,
            Name = i.Name,
            Description = i.Description,
            Price = i.Price,
            Quantity = i.Quantity,
            LineTotal = i.Price * i.Quantity
        }).ToList()
    };
}
