// Strict Union Type for Currency
export type CurrencyCode = 'USD' | 'EUR' | 'PLN' | 'GBP'; 

// Enforcing Finite States via Enum (Robustness)
export enum ReceiptStatus {
  Scanning = 'SCANNING',       // Image sent to API
  Review = 'REVIEW',           // Confidence score low, needs user check
  Confirmed = 'CONFIRMED'      // Safe to include in spending charts
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface Receipt {
  readonly id: string; // UUID from Backend
  readonly userId: string;
  
  // Extracted Core Data
  merchant: string;
  total: number;
  currency: CurrencyCode;
  date: string; // ISO String
  
  // AI/Classification Data
  categoryId: number;
  items: ReceiptItem[];
  confidenceScore: number; // 0.0 to 1.0
  status: ReceiptStatus;
  
  // Asset
  imageUrl: string;
  
  readonly createdAt: string;
}