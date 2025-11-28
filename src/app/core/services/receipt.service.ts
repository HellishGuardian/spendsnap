import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Receipt, ReceiptStatus } from '../models/receipt.model';

@Injectable({
  providedIn: 'root' // Singleton
})
export class ReceiptService {
  
  private receiptsSubject = new BehaviorSubject<Receipt[]>([]);
  public receipts$ = this.receiptsSubject.asObservable(); // Public read-only stream

  // A computed selector for the Dashboard total
  public totalSpendThisMonth$ = this.receipts$.pipe(
    map(receipts => 
      receipts
        .filter(r => r.status === ReceiptStatus.Confirmed)
        .reduce((acc, curr) => acc + curr.total, 0)
    )
  );

  constructor() { }

  // Method to expose the Observable stream (used in DashboardComponent)
  getReceipts$(): Observable<Receipt[]> {
    return this.receipts$;
  }

  setReceipts(receipts: Receipt[]): void {
    this.receiptsSubject.next(receipts);
  }

  addReceipt(receipt: Receipt): void {
    // Immutable update: Ensures change detection works reliably (DRY/Robust)
    const currentValue = this.receiptsSubject.getValue();
    this.receiptsSubject.next([receipt, ...currentValue]);
  }

  getReceiptsCount(): number {
      const receipts = this.receiptsSubject.getValue();
      return receipts ? receipts.length : 0;
  }
}