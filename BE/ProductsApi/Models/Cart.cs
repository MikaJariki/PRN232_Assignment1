namespace ProductsApi.Models;

public class CartItem
{
    public string Id { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public string ProductId { get; set; } = default!;
    public int Quantity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = default!;
    public Product Product { get; set; } = default!;
}

public class CartItemDto
{
    public required string Id { get; init; }
    public required string ProductId { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required decimal Price { get; init; }
    public string? Image { get; init; }
    public required int Quantity { get; init; }
    public required decimal LineTotal { get; init; }
}

public class UpdateCartItemRequest
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
}

public class CartResponse
{
    public required IReadOnlyList<CartItemDto> Items { get; init; }
    public required decimal Total { get; init; }
}

public class CartQuantityRequest
{
    public int Quantity { get; set; }
}
