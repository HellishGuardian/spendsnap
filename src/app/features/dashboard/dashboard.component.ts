import { Component, OnInit, OnDestroy } from '@angular/core'; // <-- Add OnInit, OnDestroy
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonFab, IonFabButton, IonIcon, IonSpinner,
  IonList, IonItem, IonLabel, IonListHeader, IonBadge, IonModal // <-- Added list components
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera } from 'ionicons/icons';
import { CameraService } from '../../core/services/camera.service';
import { ApiService } from '../../core/http/api.service';
import { ReceiptService } from '../../core/services/receipt.service';
import { ScanRequest } from '../../core/models/api.model';
import { Receipt, ReceiptStatus } from '../../core/models/receipt.model'; // <-- Ensure Receipt is imported
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs'; // <-- Added RxJS imports
import { ReceiptDetailComponent } from './receipt-detail/receipt-detail.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonFab, IonFabButton, IonIcon, IonSpinner,
    IonList, IonItem, IonLabel, IonListHeader, IonBadge, IonModal,
    ReceiptDetailComponent
  ]
})
export class DashboardComponent implements OnInit, OnDestroy { // <-- Implement OnInit, OnDestroy
  
  // Property to hold the array of receipts using Angular's async pipe in the template
  receipts$!: Observable<Receipt[]>;
  isProcessing = false; 
  private receiptsSubscription!: Subscription;
  public ReceiptStatus = ReceiptStatus;
  selectedReceipt: Receipt | null = null;

  public get receiptCount(): number {
    return this.receiptService.getReceiptsCount();
  }

  constructor(
    private cameraService: CameraService,
    private apiService: ApiService,
    public receiptService: ReceiptService,
    private router: Router
  ) {
    addIcons({ camera }); 
    // Get the receipts Observable stream from the service
    this.receipts$ = this.receiptService.getReceipts$(); 
  }

  ngOnInit() {
    // 1. Fetch data when the component loads
    this.fetchReceipts();
  }
  
  ngOnDestroy(): void {
    // Ensure the subscription is cleaned up when the component is destroyed
    if (this.receiptsSubscription) {
      this.receiptsSubscription.unsubscribe();
    }
  }

  // New method to handle fetching data and updating the service state
  fetchReceipts() {
    this.isProcessing = true; // Use the processing state for initial load indicator
    
    this.receiptsSubscription = this.apiService.getAllReceipts().subscribe({
      next: (data) => {
        console.log('[FRONTEND]: Fetched Receipts:', data);
        // 2. Update the service state with the fetched data
        this.receiptService.setReceipts(data); 
      },
      error: (err) => {
        console.error('[FRONTEND]: Error fetching receipts:', err);
      },
      complete: () => {
        this.isProcessing = false;
      }
    });
  }


  async onCameraClick() {
    this.isProcessing = true;
    
    // 1. SNAP THE PICTURE
    const image = await this.cameraService.takePicture(); 
    
    if (!image || !image.base64String) {
      this.isProcessing = false; 
      return; 
    }

    console.log("Image promise successfully resolved.");

    const mockUserId = 'user_abc123'; 
    const scanRequest: ScanRequest = {
      image_base64: image.base64String,
      user_id: mockUserId,
      currency_hint: 'PLN'
    };

    try {
      // 2. PROCESS AND SAVE VIA API
      const newReceipt = await this.apiService.scanReceipt(scanRequest);
      
      if (newReceipt) {
        // CRITICAL FIX: MAP ScanResponse to the full Receipt model
        const fullReceipt: Receipt = {
         ...newReceipt, // Copy all fields: id, merchant, total, etc.
         
         // Supply the missing fields required by the full 'Receipt' model:
         userId: scanRequest.user_id, // We know the user from the original request
         imageUrl: 'assets/mock/placeholder.jpg', // Use a placeholder/mock URL
         createdAt: new Date().toISOString(), // Use the current time
        };

        this.receiptService.addReceipt(fullReceipt); 
         // 3. UPDATE STATE: Add the newly created receipt to the service array
      }
      
    } catch (error) {
      console.error('Error during scan and save:', error);
      // ... alert logic ...
    } finally {
      this.isProcessing = false; 
    }
  }

  openReceiptDetail(receipt: Receipt) {
    this.selectedReceipt = receipt;
  }

  handleModalDismiss(updated: boolean) {
    this.selectedReceipt = null; 
  }
}