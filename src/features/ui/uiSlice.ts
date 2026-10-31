import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  currency: 'BDT' | 'USD';
  exchangeRateBDTtoUSD: number; // e.g. 1 USD = 120 BDT
  wishlistProductIds: string[];
  searchModalOpen: boolean;
}

const WISHLIST_KEY = 'novara_wishlist_ids_v1';

function getInitialWishlist(): string[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return ['prod-1', 'prod-2']; // 2 initial items matching wishlist badge "2" in reference image!
}

const initialState: UIState = {
  currency: 'USD',
  exchangeRateBDTtoUSD: 120,
  wishlistProductIds: getInitialWishlist(),
  searchModalOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.wishlistProductIds.includes(id)) {
        state.wishlistProductIds = state.wishlistProductIds.filter((item) => item !== id);
      } else {
        state.wishlistProductIds.push(id);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(state.wishlistProductIds));
      }
    },
    setCurrency: (state, action: PayloadAction<'BDT' | 'USD'>) => {
      state.currency = action.payload;
    },
    toggleSearchModal: (state, action: PayloadAction<boolean | undefined>) => {
      state.searchModalOpen = action.payload !== undefined ? action.payload : !state.searchModalOpen;
    },
  },
});

export const { toggleWishlist, setCurrency, toggleSearchModal } = uiSlice.actions;
export default uiSlice.reducer;
