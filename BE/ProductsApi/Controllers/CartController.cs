using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductsApi.Models;
using ProductsApi.Services;

namespace ProductsApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CartController(ICartService cartService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CartResponse>> List()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var result = await cartService.ListAsync(userId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CartResponse>> Add([FromBody] UpdateCartItemRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        try
        {
            var result = await cartService.AddOrUpdateAsync(userId, request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return ValidationProblem(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CartResponse>> Update(string id, [FromBody] CartQuantityRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        try
        {
            var result = await cartService.UpdateQuantityAsync(userId, id, request.Quantity);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return ValidationProblem(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<CartResponse>> Remove(string id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        try
        {
            var result = await cartService.RemoveAsync(userId, id);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return ValidationProblem(ex.Message);
        }
    }

    [HttpDelete]
    public async Task<ActionResult<CartResponse>> Clear()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var result = await cartService.ClearAsync(userId);
        return Ok(result);
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
}
