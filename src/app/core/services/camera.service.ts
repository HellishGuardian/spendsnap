import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { isPlatform } from '@ionic/angular/standalone'; // <-- NEW IMPORT

// A 1x1 black pixel used for mock data
const MOCK_BASE64_IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7'; 

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() { }

  async takePicture(): Promise<Photo | undefined> {
    // 1. DEVELOPMENT BYPASS: If running on the desktop browser, 
    // immediately return a mock image to prevent blocking.
    if (isPlatform('desktop') || isPlatform('mobileweb')) {
      console.log('--- DEVELOPMENT MODE: Bypassing Capacitor Camera ---');
      
      // Simulate an asynchronous delay to mimic real world network/camera interaction
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      return {
        webPath: MOCK_BASE64_IMAGE,
        path: MOCK_BASE64_IMAGE,
        format: 'jpeg',
        base64String: MOCK_BASE64_IMAGE.split(',')[1] 
      } as Photo;
    }

    // 2. ACTUAL CAPACITOR CALL (Only runs on native iOS/Android builds)
    try {
      const image = await Camera.getPhoto({
        quality: 90, 
        allowEditing: true,
        resultType: CameraResultType.Base64, 
        source: CameraSource.Prompt
      });
      return image;
    } catch (error) {
      console.warn('Camera action cancelled or failed:', error);
      return undefined;
    }
  }
}