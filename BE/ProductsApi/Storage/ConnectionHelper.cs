using System.Collections.Generic;
using Microsoft.AspNetCore.WebUtilities;

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

        if (url.StartsWith("postgres", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(url);
                var userInfo = uri.UserInfo.Split(':', 2);
                var user = Uri.UnescapeDataString(userInfo[0]);
                var pwd = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;
                var db = uri.AbsolutePath.Trim('/');

                var parts = new List<string>
                {
                    $"Host={host}",
                    $"Port={port}",
                    $"Database={db}",
                    $"Username={user}",
                    $"Password={pwd}"
                };

                var hasSsl = false;
                var hasTrust = false;
                var queryParams = QueryHelpers.ParseQuery(uri.Query);
                foreach (var kv in queryParams)
                {
                    var key = kv.Key;
                    var value = kv.Value.ToString();
                    if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(value)) continue;

                    if (string.Equals(key, "sslmode", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(key, "ssl mode", StringComparison.OrdinalIgnoreCase))
                    {
                        parts.Add($"Ssl Mode={value}");
                        hasSsl = true;
                        continue;
                    }
                    if (string.Equals(key, "trust_server_certificate", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(key, "trust server certificate", StringComparison.OrdinalIgnoreCase))
                    {
                        parts.Add($"Trust Server Certificate={value}");
                        hasTrust = true;
                        continue;
                    }

                    parts.Add($"{key}={value}");
                }

                if (!hasSsl)
                {
                    parts.Add("Ssl Mode=Require");
                }
                if (!hasTrust)
                {
                    parts.Add("Trust Server Certificate=true");
                }

                return string.Join(';', parts);
            }
            catch
            {
                return null;
            }
        }

        return url;
    }
}
