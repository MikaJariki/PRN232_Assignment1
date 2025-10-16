using ProductsApi.Models;

namespace ProductsApi.Services;

public interface IOrderService
{
    Task<OrderDetails> CheckoutAsync(string userId, bool markPaid);
    Task<IReadOnlyList<OrderSummary>> ListAsync(string userId);
    Task<OrderDetails?> GetAsync(string userId, string orderId);
    Task<OrderDetails?> MarkPaidAsync(string userId, string orderId);
}
