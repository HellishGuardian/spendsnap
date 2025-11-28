import { ReceiptStatus, CurrencyCode, ReceiptItem } from './receipt.model';

// --- REQUEST MODEL (Frontend -> Backend) ---
export interface ScanRequest {
  image_base64: string;
  user_id: string;
  currency_hint?: CurrencyCode;
}

// --- RESPONSE MODEL (Backend -> Frontend) ---
export interface ScanResponse {
  id: string;
  merchant: string;
  total: number;
  currency: CurrencyCode;
  date: string;
  categoryId: number;
  items: ReceiptItem[];
  confidenceScore: number;
  status: ReceiptStatus.Review | ReceiptStatus.Confirmed; 
}