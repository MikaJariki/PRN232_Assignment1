using ProductsApi.Models;

namespace ProductsApi.Repository;

public interface IProductRepository
{
    Task<Paged<Product>> ListAsync(ProductQuery query);
    Task<Product?> GetAsync(string id);
    Task<Product> CreateAsync(CreateProductDto input);
    Task<Product?> UpdateAsync(string id, UpdateProductDto patch);
    Task<bool> DeleteAsync(string id);
}

