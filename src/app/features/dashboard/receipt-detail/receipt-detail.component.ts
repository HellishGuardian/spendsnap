import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButton,
  IonModal, IonList, IonItem, IonLabel, IonNote,
  IonSelect, IonSelectOption, IonBadge, IonContent,
  IonButtons, IonFooter, IonListHeader
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Receipt, ReceiptStatus } from '../../../core/models/receipt.model'; // Assuming this path is correct
import { ReceiptService } from '../../../core/services/receipt.service'; // Assuming this path is correct
import { ApiService } from '../../../core/http/api.service'; // Assuming this path is correct
import { firstValueFrom } from 'rxjs'; 

// Define the available statuses for the user to select
// NOTE: These must match the backend enum values (REVIEW, CONFIRMED)
export const UpdateStatuses = {
    REVIEW: 'REVIEW',
    CONFIRMED: 'CONFIRMED'
};

@Component({
  selector: 'app-receipt-detail',
  templateUrl: './receipt-detail.component.html',
  styleUrls: ['./receipt-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, // Required for IonSelect two-way binding ([ngModel])
    IonHeader, IonToolbar, IonTitle, IonButton, 
    IonModal, IonList, IonItem, IonLabel, IonNote, 
    IonSelect, IonSelectOption, IonBadge, IonContent, 
    IonButtons, IonFooter, IonListHeader
  ]
})
export class ReceiptDetailComponent {
  
  // Input: The receipt data passed from the dashboard
  @Input() receipt!: Receipt;
  
  // Output: Event emitted when the modal is dismissed or data is updated
  @Output() dismiss = new EventEmitter<boolean>();

  // Local state for the selected status in the dropdown
  selectedStatus!: string;
  public UpdateStatuses = UpdateStatuses; // Expose the constants to the template

  constructor(
    private apiService: ApiService,
    private receiptService: ReceiptService
  ) { }

  // Runs when the modal opens and the input receipt is available
  ionViewWillEnter() {
    if (this.receipt) {
        // Initialize the select box with the receipt's current status
        this.selectedStatus = this.receipt.status;
    }
  }

  // Closes the modal
  onDismiss() {
    // Pass 'false' to indicate no update was made or success is handled internally
    this.dismiss.emit(false);
  }
  
  // Handles the status update logic
  async onSaveStatus(): Promise<void> {
    // 1. Guard clause: Do nothing if status is unchanged
    if (this.selectedStatus === this.receipt.status) {
      this.dismiss.emit(false);
      return;
    }

    try {
      // FIX 1: Explicitly cast selectedStatus to ReceiptStatus
      const updateDto: Partial<Receipt> = { 
          status: this.selectedStatus as ReceiptStatus 
      };
      
      const updatedReceipt = await this.apiService
        .updateReceipt(this.receipt.id, updateDto) 
        .toPromise();

      // FIX 2: Check for undefined return before passing to service
      if (updatedReceipt) { 
          // Success path
          this.receiptService.updateReceipt(updatedReceipt);
          this.dismiss.emit(true); 
      } else {
          // Fallback if the observable completes but returns no value
          console.warn('API update succeeded but returned no updated receipt.');
          this.dismiss.emit(false);
      }

    } catch (error) {
      // Error path
      console.error('Error updating receipt status:', error);
      this.dismiss.emit(false); 
    }
  }
}