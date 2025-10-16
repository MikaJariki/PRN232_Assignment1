using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductsApi.Models;
using ProductsApi.Services;

namespace ProductsApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderSummary>>> List()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var orders = await orderService.ListAsync(userId);
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDetails>> Get(string id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var order = await orderService.GetAsync(userId, id);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDetails>> Checkout([FromBody] CheckoutRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        try
        {
            var order = await orderService.CheckoutAsync(userId, request.MarkAsPaid);
            return Ok(order);
        }
        catch (ArgumentException ex)
        {
            return ValidationProblem(ex.Message);
        }
    }

    [HttpPost("{id}/pay")]
    public async Task<ActionResult<OrderDetails>> MarkPaid(string id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var order = await orderService.MarkPaidAsync(userId, id);
        return order is null ? NotFound() : Ok(order);
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
}
