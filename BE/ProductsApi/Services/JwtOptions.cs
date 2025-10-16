namespace ProductsApi.Services;

public class JwtOptions
{
    public const string Section = "Jwt";
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "ProductsApi";
    public string Audience { get; set; } = "ProductsApiClient";
    public int ExpiryMinutes { get; set; } = 60 * 24;
}
