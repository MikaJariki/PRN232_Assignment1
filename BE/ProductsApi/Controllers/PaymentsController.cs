using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductsApi.Services;

namespace ProductsApi.Controllers;

[ApiController]
[Route("api/payments/stripe")]
public class PaymentsController(StripeService stripeService, ILogger<PaymentsController> logger) : ControllerBase
{
    [Authorize]
    [HttpPost("checkout")]
    public async Task<ActionResult<object>> CreateCheckout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await stripeService.CreateCheckoutAsync(userId);
            return Ok(new
            {
                orderId = result.OrderId,
                checkoutUrl = result.CheckoutUrl,
                sessionId = result.SessionId
            });
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Stripe checkout failed.");
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        if (!stripeService.IsConfigured)
        {
            return StatusCode(503, new { message = "Stripe is not configured." });
        }

        string payload;
        using (var reader = new StreamReader(Request.Body))
        {
            payload = await reader.ReadToEndAsync();
        }

        var signature = Request.Headers["Stripe-Signature"].ToString();

        try
        {
            await stripeService.HandleWebhookAsync(payload, signature);
            return Ok(new { status = "received" });
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Stripe webhook handling failed.");
            return BadRequest(new { message = ex.Message });
        }
    }
}
