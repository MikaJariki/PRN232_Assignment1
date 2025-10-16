using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using ProductsApi.Models;
using Stripe;
using Stripe.Checkout;

namespace ProductsApi.Services;

public record StripeCheckoutResult(string OrderId, string CheckoutUrl, string SessionId);

public class StripeService
{
    private readonly StripeOptions _options;
    private readonly IOrderService _orderService;
    private readonly ICartService _cartService;
    private readonly ILogger<StripeService> _logger;

    public StripeService(
        IOptions<StripeOptions> optionsAccessor,
        IOrderService orderService,
        ICartService cartService,
        ILogger<StripeService> logger)
    {
        _options = optionsAccessor.Value;
        _orderService = orderService;
        _cartService = cartService;
        _logger = logger;

        _logger.LogInformation("Stripe options loaded. SecretKey configured: {HasSecret}, PublishableKey configured: {HasPublishable}, WebhookSecret configured: {HasWebhook}",
            !string.IsNullOrWhiteSpace(_options.SecretKey),
            !string.IsNullOrWhiteSpace(_options.PublishableKey),
            !string.IsNullOrWhiteSpace(_options.WebhookSecret));

        if (!string.IsNullOrWhiteSpace(_options.SecretKey))
        {
            StripeConfiguration.ApiKey = _options.SecretKey;
        }
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_options.SecretKey) &&
        !string.IsNullOrWhiteSpace(_options.PublishableKey) &&
        !string.IsNullOrWhiteSpace(_options.SuccessUrl) &&
        !string.IsNullOrWhiteSpace(_options.CancelUrl);

    public async Task<StripeCheckoutResult> CreateCheckoutAsync(string userId)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("Stripe is not fully configured. Please set Stripe:SecretKey, Stripe:PublishableKey, Stripe:SuccessUrl and Stripe:CancelUrl.");
        }

        var order = await _orderService.CheckoutAsync(userId, markPaid: false);

        var currency = string.IsNullOrWhiteSpace(_options.Currency)
            ? "usd"
            : _options.Currency.ToLowerInvariant();

        var lineItems = order.Items.Select(item =>
        {
            var amount = Convert.ToInt64(Math.Round(item.Price * 100m, MidpointRounding.AwayFromZero));
            return new SessionLineItemOptions
            {
                Quantity = item.Quantity,
                PriceData = new SessionLineItemPriceDataOptions
                {
                    UnitAmount = amount,
                    Currency = currency,
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = item.Name,
                        Description = item.Description
                    }
                }
            };
        }).ToList();

        var successUrl = AppendQuery(_options.SuccessUrl, new Dictionary<string, string?>
        {
            ["session_id"] = "{CHECKOUT_SESSION_ID}",
            ["orderId"] = order.Id
        });

        var cancelUrl = AppendQuery(_options.CancelUrl, new Dictionary<string, string?>
        {
            ["orderId"] = order.Id
        });

        var options = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            LineItems = lineItems,
            Metadata = new Dictionary<string, string>
            {
                ["orderId"] = order.Id,
                ["userId"] = userId
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        if (string.IsNullOrWhiteSpace(session.Url))
        {
            throw new InvalidOperationException("Stripe session did not return a checkout URL.");
        }

        return new StripeCheckoutResult(order.Id, session.Url, session.Id);
    }

    public async Task HandleWebhookAsync(string payload, string signatureHeader)
    {
        if (string.IsNullOrWhiteSpace(_options.WebhookSecret))
        {
            throw new InvalidOperationException("Stripe webhook secret is not configured.");
        }

        Event stripeEvent;
        try
        {
            _logger.LogInformation("Handling Stripe webhook with signature header: {SignatureHeader}", signatureHeader);
            stripeEvent = EventUtility.ConstructEvent(
                payload,
                signatureHeader,
                _options.WebhookSecret,
                throwOnApiVersionMismatch: false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Stripe webhook signature verification failed.");
            throw new InvalidOperationException($"Stripe webhook signature verification failed: {ex.Message}");
        }

        _logger.LogInformation("Received Stripe event {Type}", stripeEvent.Type);

        if (stripeEvent.Type != Events.CheckoutSessionCompleted)
        {
            _logger.LogInformation("Ignoring Stripe event {Type}", stripeEvent.Type);
            return;
        }

        if (stripeEvent.Data.Object is not Session session)
        {
            _logger.LogWarning("Stripe event data is not a checkout session.");
            return;
        }

        if (!session.Metadata.TryGetValue("orderId", out var orderId) ||
            !session.Metadata.TryGetValue("userId", out var userId))
        {
            _logger.LogWarning("Stripe session missing metadata orderId or userId.");
            return;
        }

        _logger.LogInformation("Marking order {OrderId} paid for user {UserId}", orderId, userId);
        await _orderService.MarkPaidAsync(userId, orderId);
        await _cartService.ClearAsync(userId);
    }

    private static string AppendQuery(string baseUrl, IDictionary<string, string?> parameters)
    {
        if (string.IsNullOrWhiteSpace(baseUrl)) return baseUrl;
        var filtered = parameters
            .Where(kv => !string.IsNullOrWhiteSpace(kv.Value))
            .ToDictionary(kv => kv.Key, kv => (string?)kv.Value);
        return filtered.Count == 0 ? baseUrl : QueryHelpers.AddQueryString(baseUrl, filtered);
    }
}
