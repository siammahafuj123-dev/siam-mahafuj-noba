import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';
import { AuthModal } from '../components/modal/AuthModal';
import { ToastContainer } from '../components/feedback/ToastContainer';

interface StorefrontLayoutProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  children: React.ReactNode;
}

export const StorefrontLayout: React.FC<StorefrontLayoutProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-950">
      {/* 1. Customer-facing Header with announcement bar, search, badges, and user navigation */}
      <Header currentView={currentView} onNavigate={onNavigate} />

      {/* 2. Main Storefront Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* 3. Customer-facing Footer matching ShopMax aesthetic */}
      <Footer onNavigate={onNavigate} />

      {/* 4. Global Overlays & Modals specific to storefront shopping */}
      <CartDrawer
        onNavigateToCheckout={() => onNavigate('checkout')}
        onNavigateToShop={() => onNavigate('shop')}
      />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};
