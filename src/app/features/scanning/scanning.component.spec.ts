import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScanningComponent } from './scanning.component';

describe('ScanningComponent', () => {
  let component: ScanningComponent;
  let fixture: ComponentFixture<ScanningComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ScanningComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
