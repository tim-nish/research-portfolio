import ProductListCard, { type ProductListCardProps } from "../components/ProductListCard";

interface RetiredProduct {
  slug: string;
  title: string;
  sunsetDate: string;
}

export interface ProductsIndexPageProps {
  live: ProductListCardProps[];
  validating: ProductListCardProps[];
  retired: RetiredProduct[];
}

function ProductsIndexPage({ live, validating, retired }: ProductsIndexPageProps) {
  return (
    <article className="products-index">
      <h1>Products</h1>
      <p className="products-intro">Small, focused tools, built for researchers unless stated otherwise.</p>

      {live.length > 0 && (
        <div className="projects">
          {live.map((product) => (
            <ProductListCard key={product.slug} {...product} />
          ))}
        </div>
      )}

      {validating.length > 0 && (
        <section aria-labelledby="validating-heading">
          <h2 id="validating-heading">Validating</h2>
          <div className="projects">
            {validating.map((product) => (
              <ProductListCard key={product.slug} {...product} />
            ))}
          </div>
        </section>
      )}

      {retired.length > 0 && (
        <details className="products-retired">
          <summary>Retired ({retired.length})</summary>
          <ul className="retired-products-list">
            {retired.map((product) => (
              <li key={product.slug}>
                <a href={`/products/${product.slug}/`}>{product.title}</a> — retired {product.sunsetDate}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

export default ProductsIndexPage;
