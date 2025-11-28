import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { ScanRequest, ScanResponse } from '../models/api.model';
import { environment } from 'src/environments/environment'; // Standard Angular practice
import { Receipt } from '../models/receipt.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // Use the environment file for the base URL (Robustness principle)
  private readonly API_URL = environment.apiBaseUrl; 

  constructor(private http: HttpClient) { }

  /**
   * Calls the remote backend to process the image via LLM (Layer IV).
   * @param request The image data and user ID.
   * @returns A Promise resolving to the structured receipt data.
   */
  async scanReceipt(request: ScanRequest): Promise<ScanResponse> {
    const url = `${this.API_URL}/v1/scan`;
    
    // We convert the RxJS Observable to a Promise (firstValueFrom) 
    // to make integration with our async/await components cleaner.
    return firstValueFrom(
      // The POST request is strongly typed to ScanResponse
      this.http.post<ScanResponse>(url, request) 
    );
  }

  getAllReceipts(): Observable<Receipt[]> {
    // For development, we hardcode the user ID in the query params
    const params = new HttpParams().set('userId', 'user_abc123'); 

    // This makes a GET request to http://localhost:3000/receipt?userId=user_abc123
    return this.http.get<Receipt[]>(`${this.API_URL}/receipt`, { params });
  }
}