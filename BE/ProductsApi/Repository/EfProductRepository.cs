using Microsoft.EntityFrameworkCore;
using ProductsApi.Models;
using ProductsApi.Storage;

namespace ProductsApi.Repository;

public class EfProductRepository(AppDbContext db) : IProductRepository
{
    public async Task<Paged<Product>> ListAsync(ProductQuery query)
    {
        IQueryable<Product> q = db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim().ToLower();
            q = q.Where(p => (p.Name + " " + p.Description).ToLower().Contains(s));
        }
        if (query.MinPrice is not null) q = q.Where(p => p.Price >= query.MinPrice);
        if (query.MaxPrice is not null) q = q.Where(p => p.Price <= query.MaxPrice);

        var total = await q.CountAsync();
        var pageSize = Math.Max(1, query.PageSize);
        var page = Math.Max(1, query.Page);
        var items = await q
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new Paged<Product>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public Task<Product?> GetAsync(string id) => db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Product> CreateAsync(CreateProductDto input)
    {
        var now = DateTime.UtcNow;
        var entity = new Product
        {
            Id = Guid.NewGuid().ToString("n"),
            Name = input.Name,
            Description = input.Description,
            Price = input.Price,
            Image = input.Image,
            CreatedAt = now,
            UpdatedAt = now
        };
        db.Products.Add(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    public async Task<Product?> UpdateAsync(string id, UpdateProductDto patch)
    {
        var entity = await db.Products.FindAsync(id);
        if (entity is null) return null;
        entity.Name = patch.Name ?? entity.Name;
        entity.Description = patch.Description ?? entity.Description;
        entity.Price = patch.Price ?? entity.Price;
        entity.Image = patch.Image ?? entity.Image;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var entity = await db.Products.FindAsync(id);
        if (entity is null) return false;
        db.Products.Remove(entity);
        await db.SaveChangesAsync();
        return true;
    }
}

