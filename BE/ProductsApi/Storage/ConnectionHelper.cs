using System.Text.RegularExpressions;

namespace ProductsApi.Storage;

public static class ConnectionHelper
{
    // Reads typical env/config keys and builds an Npgsql connection string
    public static string? GetPostgresConnectionString(IConfiguration config)
    {
        var direct = config.GetConnectionString("Default");
        if (!string.IsNullOrWhiteSpace(direct)) return direct;

        var url = Environment.GetEnvironmentVariable("DATABASE_URL")
                  ?? config["DATABASE_URL"]
                  ?? config["POSTGRES_URL"]
                  ?? config["POSTGRES_CONNECTION"];

        if (string.IsNullOrWhiteSpace(url)) return null;

        // Accepts postgres://user:pass@host:port/db?sslmode=Require
        if (url.StartsWith("postgres", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(url);
                var userInfo = uri.UserInfo.Split(':', 2);
                var user = Uri.UnescapeDataString(userInfo[0]);
                var pwd = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;
                var db = uri.AbsolutePath.Trim('/');
                var query = uri.Query.TrimStart('?');
                var extra = query.Replace('&', ';');
                var ssl = extra.Contains("sslmode", StringComparison.OrdinalIgnoreCase) ? "" : ";Ssl Mode=Require;Trust Server Certificate=true";
                return $"Host={host};Port={port};Database={db};Username={user};Password={pwd};{extra}{ssl}".TrimEnd(';');
            }
            catch
            {
                return null;
            }
        }

        return url;
    }
}

