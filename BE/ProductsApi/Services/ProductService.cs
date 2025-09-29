using ProductsApi.Models;
using ProductsApi.Repository;

namespace ProductsApi.Services;

public class ProductService(IProductRepository repo) : IProductService
{
    private static void Validate(CreateProductDto input)
    {
        if (string.IsNullOrWhiteSpace(input.Name)) throw new ArgumentException("Name is required");
        if (string.IsNullOrWhiteSpace(input.Description)) throw new ArgumentException("Description is required");
        if (input.Price < 0) throw new ArgumentException("Price must be >= 0");
    }

    private static void Validate(UpdateProductDto patch)
    {
        if (patch.Price is < 0) throw new ArgumentException("Price must be >= 0");
        if (patch.Name is { Length: 0 }) throw new ArgumentException("Name cannot be empty");
        if (patch.Description is { Length: 0 }) throw new ArgumentException("Description cannot be empty");
    }

    public Task<Paged<Product>> ListAsync(ProductQuery query) => repo.ListAsync(query);

    public Task<Product?> GetAsync(string id) => repo.GetAsync(id);

    public Task<Product> CreateAsync(CreateProductDto input)
    {
        Validate(input);
        return repo.CreateAsync(input);
    }

    public Task<Product?> UpdateAsync(string id, UpdateProductDto patch)
    {
        Validate(patch);
        return repo.UpdateAsync(id, patch);
    }

    public Task<bool> DeleteAsync(string id) => repo.DeleteAsync(id);
}

