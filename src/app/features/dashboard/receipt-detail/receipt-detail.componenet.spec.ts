import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceiptDetailComponent } from './receipt-detail.component'; 
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/http/api.service';
import { ReceiptService } from '../../../core/services/receipt.service';
import { of, throwError } from 'rxjs'; 
import { Receipt, ReceiptStatus } from '../../../core/models/receipt.model';

// --- MOCK SERVICES (Using Jasmine Spies) ---
const mockApiService = {
  updateReceipt: jasmine.createSpy('updateReceipt'), 
};
const mockReceiptService = {
  updateReceipt: jasmine.createSpy('updateReceipt'),
};

// --- MOCK DATA ---
const mockReceipt: Receipt = {
  id: 'rct-101',
  userId: 'user-abc123',
  merchant: 'TestMart',
  total: 25.50,
  currency: 'PLN',
  status: ReceiptStatus.Review, // Initial status for test
  date: new Date().toISOString(),
  items: [{ name: 'Test Item', price: 10.00 }],
  confidenceScore: 1,
  imageUrl: 'url',
  categoryId: 1,
  createdAt: new Date().toISOString(), 
};


fdescribe('ReceiptDetailComponent', () => {
  let component: ReceiptDetailComponent;
  let fixture: ComponentFixture<ReceiptDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptDetailComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: ReceiptService, useValue: mockReceiptService },
      ],
    }).compileComponents();
  });
  
  beforeEach(() => {
    // Reset spies before each test
    mockApiService.updateReceipt.calls.reset();
    mockReceiptService.updateReceipt.calls.reset();
    
    fixture = TestBed.createComponent(ReceiptDetailComponent);
    component = fixture.componentInstance;
    
    // 2. Set the @Input() property
    component.receipt = {...mockReceipt}; 
    
    // 3. Manually run ionViewWillEnter to set up initial state
    component.ionViewWillEnter(); 
    
    fixture.detectChanges();
  });
  
  // Test Case 1: Initialization
  it('should create and initialize selectedStatus with the current receipt status', () => {
    expect(component).toBeTruthy();
    expect(component.selectedStatus).toBe(ReceiptStatus.Review); 
  });
  
  // Test Case 2: Dismissal when explicitly closing
  it('should emit false when onDismiss is called', () => {
    spyOn(component.dismiss, 'emit'); 
    component.onDismiss();
    expect(component.dismiss.emit).toHaveBeenCalledWith(false);
  });

  // Test Case 3: Dismissal when status is unchanged
  it('should dismiss without calling API services if status is unchanged', async () => {
    spyOn(component.dismiss, 'emit');
    
    await component.onSaveStatus(); 
    
    expect(mockApiService.updateReceipt).not.toHaveBeenCalled();
    expect(mockReceiptService.updateReceipt).not.toHaveBeenCalled();
    expect(component.dismiss.emit).toHaveBeenCalledWith(false); 
  });

  // Test Case 4: Successful status update
  it('should update status, call services, and emit success when status changes', async () => {
    spyOn(component.dismiss, 'emit');
    
    // === FIX 2: Use ReceiptStatus directly ===
    const newStatus = ReceiptStatus.Confirmed;
    // =========================================
    
    const updatedReceipt: Receipt = {...mockReceipt, status: newStatus};

    mockApiService.updateReceipt.and.returnValue(of(updatedReceipt));
    
    // Act: Change status and save
    component.selectedStatus = newStatus;
    await component.onSaveStatus();

    // Assert 1: API and local state services were called correctly
    expect(mockApiService.updateReceipt).toHaveBeenCalledWith(
        mockReceipt.id,
        // The cast 'as ReceiptStatus' is no longer needed since 'newStatus' is already the correct type
        { status: newStatus } 
    );
    expect(mockReceiptService.updateReceipt).toHaveBeenCalledWith(updatedReceipt);
    
    // Assert 2: Modal was dismissed with success signal
    expect(component.dismiss.emit).toHaveBeenCalledWith(true);
  });
  
  // Test Case 5: Error handling during update
  it('should log error but still dismiss if API call fails', async () => {
    spyOn(console, 'error'); 
    spyOn(component.dismiss, 'emit');
    
    mockApiService.updateReceipt.and.returnValue(throwError(() => new Error('API Failed')));

    // Act: Change status and save
    component.selectedStatus = ReceiptStatus.Confirmed; // Use ReceiptStatus directly
    await component.onSaveStatus();
    
    // Assert: Error was logged, local state was NOT updated, and dismiss was called
    expect(console.error).toHaveBeenCalled();
    expect(mockReceiptService.updateReceipt).not.toHaveBeenCalled();
    expect(component.dismiss.emit).toHaveBeenCalledWith(false); 
  });
});