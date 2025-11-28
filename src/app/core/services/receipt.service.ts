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

  /**
   * Updates a single receipt in the local state array after a successful API call.
   * This is necessary to immediately update the dashboard view without a full re-fetch.
   */
  updateReceipt(updatedReceipt: Receipt): void {
      const currentReceipts = this.receiptsSubject.getValue();
      const updatedList = currentReceipts.map(r => 
          // Replace the old receipt with the newly updated one
          r.id === updatedReceipt.id ? updatedReceipt : r
      );
      this.receiptsSubject.next(updatedList);
  }
}