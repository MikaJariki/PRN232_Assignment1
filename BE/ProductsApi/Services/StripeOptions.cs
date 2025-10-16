namespace ProductsApi.Services;

public class StripeOptions
{
    public const string Section = "Stripe";

    public string SecretKey { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string SuccessUrl { get; set; } = "http://localhost:3000/payment/success";
    public string CancelUrl { get; set; } = "http://localhost:3000/payment/cancel";
    public string Currency { get; set; } = "usd";
}
