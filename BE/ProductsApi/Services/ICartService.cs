using ProductsApi.Models;

namespace ProductsApi.Services;

public interface ICartService
{
    Task<CartResponse> ListAsync(string userId);
    Task<CartResponse> AddOrUpdateAsync(string userId, UpdateCartItemRequest request);
    Task<CartResponse> UpdateQuantityAsync(string userId, string cartItemId, int quantity);
    Task<CartResponse> RemoveAsync(string userId, string cartItemId);
    Task<CartResponse> ClearAsync(string userId);
}
