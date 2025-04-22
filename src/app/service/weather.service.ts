import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiKey: string = '8f5387fa3f64b300d2ff62f67e7258d9';  // Twój klucz API
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) { }
  
  getWeatherByCoordinates(lat: number, lon: number, units: string): Observable<any> {
    const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&units=${units}&appid=${this.apiKey}`;
    return this.http.get<any>(url);
  }
  
}
