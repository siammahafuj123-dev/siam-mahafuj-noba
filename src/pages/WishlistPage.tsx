import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ProductCard } from '../components/ui/ProductCard';
import { SeedProduct } from '../../server/data/initialData';
import { Heart, ShoppingBag } from 'lucide-react';

interface WishlistPageProps {
  onViewProduct: (slug: string) => void;
  onNavigateToShop: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  onViewProduct,
  onNavigateToShop,
}) => {
  const wishlistIds = useAppSelector((state) => state.ui.wishlistProductIds);
  const [products, setProducts] = useState<SeedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products?limit=50');
        const data = await res.json();
        if (data.success) {
          const matched = data.data.filter((p: SeedProduct) => wishlistIds.includes(p.id));
          setProducts(matched);
        }
      } catch (err) {
        console.error('Failed to load wishlist products', err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 pb-6 border-b border-gray-100 mb-8">
        <Heart className="w-6 h-6 text-emerald-800 fill-emerald-800" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          My Wishlist ({products.length})
        </h1>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-8 space-y-3">
          <Heart className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">Your wishlist is currently empty</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Click the heart icon on any product to bookmark your favorite electronics, footwear, and accessories.
          </p>
          <button
            onClick={onNavigateToShop}
            className="mt-2 px-6 py-2.5 bg-emerald-800 text-white text-xs font-bold rounded-xl"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onViewProduct={onViewProduct} />
          ))}
        </div>
      )}
    </div>
  );
};
