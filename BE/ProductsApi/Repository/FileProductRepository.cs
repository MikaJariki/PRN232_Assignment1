using System.Collections.Concurrent;
using System.Text.Json;
using ProductsApi.Models;

namespace ProductsApi.Repository;

public class FileProductRepository : IProductRepository
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _mutex = new(1, 1);
    private readonly JsonSerializerOptions _json = new(JsonSerializerDefaults.Web);

    public FileProductRepository(string filePath)
    {
        _filePath = filePath;
        var dir = Path.GetDirectoryName(_filePath)!;
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
        // Seed if file missing or empty
        if (!File.Exists(_filePath) || new FileInfo(_filePath).Length == 0)
        {
            var seed = SeedProducts();
            File.WriteAllText(_filePath, JsonSerializer.Serialize(seed, _json));
        }
    }

    public async Task<Paged<Product>> ListAsync(ProductQuery query)
    {
        var list = await ReadAsync();
        IEnumerable<Product> items = list;

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var q = query.Search.Trim().ToLowerInvariant();
            items = items.Where(p => ($"{p.Name} {p.Description}").ToLowerInvariant().Contains(q));
        }
        if (query.MinPrice is not null)
            items = items.Where(p => p.Price >= query.MinPrice);
        if (query.MaxPrice is not null)
            items = items.Where(p => p.Price <= query.MaxPrice);

        var total = items.Count();
        var pageSize = Math.Max(1, query.PageSize);
        var page = Math.Max(1, query.Page);
        var paged = items.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return new Paged<Product>
        {
            Items = paged,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<Product?> GetAsync(string id)
    {
        var list = await ReadAsync();
        return list.FirstOrDefault(p => p.Id == id);
    }

    public async Task<Product> CreateAsync(CreateProductDto input)
    {
        var list = await ReadAsync();
        var now = DateTime.UtcNow;
        var item = new Product
        {
            Id = Guid.NewGuid().ToString("n"),
            Name = input.Name,
            Description = input.Description,
            Price = input.Price,
            Image = input.Image,
            CreatedAt = now,
            UpdatedAt = now
        };
        list.Insert(0, item);
        await WriteAsync(list);
        return item;
    }

    public async Task<Product?> UpdateAsync(string id, UpdateProductDto patch)
    {
        var list = await ReadAsync();
        var idx = list.FindIndex(p => p.Id == id);
        if (idx < 0) return null;
        var existing = list[idx];
        existing.Name = patch.Name ?? existing.Name;
        existing.Description = patch.Description ?? existing.Description;
        existing.Price = patch.Price ?? existing.Price;
        existing.Image = patch.Image ?? existing.Image;
        existing.UpdatedAt = DateTime.UtcNow;
        list[idx] = existing;
        await WriteAsync(list);
        return existing;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var list = await ReadAsync();
        var removed = list.RemoveAll(p => p.Id == id) > 0;
        if (removed)
        {
            await WriteAsync(list);
        }
        return removed;
    }

    private async Task<List<Product>> ReadAsync()
    {
        await _mutex.WaitAsync();
        try
        {
            if (!File.Exists(_filePath)) return new List<Product>();
            await using var s = File.OpenRead(_filePath);
            var data = await JsonSerializer.DeserializeAsync<List<Product>>(s, _json);
            return data ?? new List<Product>();
        }
        finally
        {
            _mutex.Release();
        }
    }

    private async Task WriteAsync(List<Product> list)
    {
        await _mutex.WaitAsync();
        try
        {
            await using var s = File.Create(_filePath);
            await JsonSerializer.SerializeAsync(s, list, _json);
        }
        finally
        {
            _mutex.Release();
        }
    }

    private static List<Product> SeedProducts()
    {
        var now = DateTime.UtcNow;
        var seed = new[]
        {
            new { Name = "Classic White Tee", Description = "100% cotton, comfy everyday wear.", Price = 12.99m, Image = "https://picsum.photos/id/100/800/800" },
            new { Name = "Denim Jacket", Description = "Light wash, unisex fit.", Price = 49.50m, Image = "https://picsum.photos/id/1011/800/800" },
            new { Name = "Black Hoodie", Description = "Fleece-lined with kangaroo pocket.", Price = 35.00m, Image = "https://picsum.photos/id/1012/800/800" },
            new { Name = "Running Shorts", Description = "Breathable, quick-dry fabric.", Price = 19.99m, Image = "https://picsum.photos/id/1019/800/800" },
            new { Name = "Summer Dress", Description = "Floral print A-line.", Price = 29.90m, Image = "https://picsum.photos/id/1027/800/800" },
            new { Name = "Leather Belt", Description = "Genuine leather, adjustable.", Price = 15.00m, Image = "https://picsum.photos/id/1062/800/800" },
            new { Name = "Sport Sneakers", Description = "Lightweight, everyday sneakers.", Price = 59.00m, Image = "https://picsum.photos/id/1084/800/800" },
            new { Name = "Beanie", Description = "Warm knit beanie.", Price = 9.90m, Image = "https://picsum.photos/id/839/800/800" }
        };

        return seed.Select(s => new Product
        {
            Id = Guid.NewGuid().ToString("n"),
            Name = s.Name,
            Description = s.Description,
            Price = s.Price,
            Image = s.Image,
            CreatedAt = now,
            UpdatedAt = now
        }).ToList();
    }
}

