namespace ProductsApi.Models;

public class Order
{
    public string Id { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    public User User { get; set; } = default!;
}

public class OrderItem
{
    public string Id { get; set; } = default!;
    public string OrderId { get; set; } = default!;
    public string ProductId { get; set; } = default!;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public Order Order { get; set; } = default!;
}

public class OrderSummary
{
    public required string Id { get; init; }
    public required decimal TotalAmount { get; init; }
    public required string Status { get; init; }
    public required DateTime CreatedAt { get; init; }
}

public class OrderDetails : OrderSummary
{
    public required IReadOnlyList<OrderLineDetails> Items { get; init; }
    public DateTime? PaidAt { get; init; }
}

public class OrderLineDetails
{
    public required string ProductId { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required decimal Price { get; init; }
    public required int Quantity { get; init; }
    public required decimal LineTotal { get; init; }
}

public class CheckoutRequest
{
    public bool MarkAsPaid { get; set; }
}
