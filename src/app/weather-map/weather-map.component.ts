import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { WeatherService } from '../service/weather.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weather-map',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  providers: [WeatherService],
  templateUrl: './weather-map.component.html',
  styleUrls: ['./weather-map.component.scss']
})
export class WeatherMapComponent implements OnInit {

  cities: { name: string, lat: number, lon: number, left: number, top: number }[] = [
    { name: 'Gdańsk', lat: 54.35, lon: 18.64, left: 67, top: 43 },
    { name: 'Malbork', lat: 54.03, lon: 19.03, left: 82, top: 66 },
    { name: 'Łeba', lat: 54.77, lon: 17.56, left: 35, top: 22 },
    { name: 'Bytów', lat: 54.17, lon: 17.49, left: 25, top: 55 },
    { name: 'Chojnice', lat: 53.70, lon: 17.57, left: 31, top: 78 },
    { name: 'Człuchów', lat: 53.66, lon: 17.36, left: 20, top: 82 },
    { name: 'Hel', lat: 54.61, lon: 18.80, left: 72, top: 32 },
    { name: 'Kartuzy', lat: 54.33, lon: 18.20, left: 52, top: 48 },
    { name: 'Kościerzyna', lat: 54.12, lon: 17.98, left: 40, top: 59 },
    { name: 'Kwidzyn', lat: 53.73, lon: 18.93, left: 76, top: 78 },
    { name: 'Lębork', lat: 54.54, lon: 17.75, left: 38, top: 35 },
    { name: 'Nowy Dwór Gdański', lat: 54.22, lon: 19.12, left: 83, top: 53 },
    { name: 'Puck', lat: 54.72, lon: 18.41, left: 59, top: 23 },
    { name: 'Słupsk', lat: 54.46, lon: 17.03, left: 15, top: 47 },
    { name: 'Starogard Gdański', lat: 53.97, lon: 18.53, left: 65, top: 65 },
    { name: 'Tczew', lat: 54.09, lon: 18.78, left: 68, top: 53 },
    { name: 'Ustka', lat: 54.58, lon: 16.86, left: 10, top: 33 },
    { name: 'Wejherowo', lat: 54.61, lon: 18.23, left: 50, top: 32 }
  ];

  weatherDataMetric: any[] = [];
  weatherDataImperial: any[] = [];
  errorMessage: string | null = null;
  selectedFilter: string = '';
  units: string = 'metric';
  isMetric: boolean = true;

  private cacheDurationMs = 15 * 60 * 1000;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.selectedFilter = 'temp';
    this.fetchWeatherDataForUnits('metric');
    this.fetchWeatherDataForUnits('imperial');
  }

  fetchWeatherDataForUnits(units: 'metric' | 'imperial'): void {
    const targetArray = units === 'metric' ? this.weatherDataMetric : this.weatherDataImperial;
    targetArray.length = 0;

    this.cities.forEach(city => {
      const key = this.getCacheKey(city, units);
      const cachedData = this.loadFromCache(key);

      if (cachedData) {
        targetArray.push(this.mapWeatherData(city.name, cachedData));
      } else {
        this.weatherService.getWeatherByCoordinates(city.lat, city.lon, units).subscribe({
          next: (data) => {
            this.saveToCache(key, data);
            targetArray.push(this.mapWeatherData(city.name, data));
          },
          error: (err) => {
            this.errorMessage = `Error fetching weather data for ${city.name} (${units}): ${err}`;
            console.error(this.errorMessage);
          }
        });
      }
    });
  }

  private getCacheKey(city: any, units: string): string {
    return `weather_${city.lat}_${city.lon}_${units}`;
  }

  private saveToCache(key: string, data: any): void {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  }

  private loadFromCache(key: string): any | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp < this.cacheDurationMs) {
      return parsed.data;
    } else {
      localStorage.removeItem(key);
      return null;
    }
  }

  private mapWeatherData(cityName: string, data: any) {
    const weatherMain = data.weather?.[0]?.main || "Unknown";
    const weatherDescription = data.weather?.[0]?.description || "No description";
    const sunsetUnix = data.sys?.sunset || 0;
    const currentUnix = data.dt || Math.floor(Date.now() / 1000);
    const isDay = currentUnix < sunsetUnix;

    return {
      city: cityName,
      temp: Math.floor(data.main.temp),
      weather_main: weatherMain,
      weather_description: weatherDescription,
      sunset: sunsetUnix,
      isDay: isDay
    };
  }

  changeUnits(newUnits: string): void {
    this.units = newUnits;
    this.isMetric = (newUnits === 'metric');
  }

  getTemperature(cityName: string): number | null {
    const data = this.isMetric ? this.weatherDataMetric : this.weatherDataImperial;
    const cityWeather = data.find(item => item.city === cityName);
    return cityWeather ? cityWeather.temp : null;
  }

  getTemperatureUnit(): string {
    return this.isMetric ? '°C' : '°F';
  }

  getWeatherIcon(cityName: string): string {
    const data = this.isMetric ? this.weatherDataMetric : this.weatherDataImperial;
    const weather = data.find(item => item.city === cityName);
    if (!weather) return '';
  
    const weatherMain = weather.weather_main;
    const weatherDescription = weather.weather_description.toLowerCase();
    const isNight = !weather.isDay;
  
    if (isNight) {
      if (weatherMain === 'Clear') {
        return 'https://ocdn.eu/weather/weather_state_icons/8.svg'; 
      } else if (weatherMain === 'Clouds' && weatherDescription.includes('few')) {
        return 'https://ocdn.eu/ucs/static/pogoda/578fda62bf6ad47469548f67246cf7fc/mainWidget/png_icons_70/9.png'; 
      } else if (weatherMain === 'Clouds' && weatherDescription.includes('broken clouds')) {
        return 'https://ocdn.eu/ucs/static/pogoda/578fda62bf6ad47469548f67246cf7fc/mainWidget/png_icons_70/11.png'; 
      } else if (['Fog', 'Mist', 'Haze'].includes(weatherMain)) {
        return 'https://ocdn.eu/ucs/static/pogoda/578fda62bf6ad47469548f67246cf7fc/mainWidget/png_icons_70/9.png'; 
      }
    }
  
    const iconMap: { [key: string]: string } = {
      'Clear_clear sky_day': '1.png',
      'Clouds_few clouds_day': '2.png',
      'Clouds_scattered clouds': '3.png',
      'Clouds_broken clouds': '4.png',
      'Clouds_overcast clouds': '5.png',
      'Rain_light rain': '6.png',
      'Rain_moderate rain': '7.png',
      'Rain_heavy intensity rain': '8.png',
      'Rain_very heavy rain': '9.png',
      'Rain_freezing rain': '10.png',
      'Snow_light snow': '11.png',
      'Snow_moderate snow': '12.png',
      'Snow_heavy snow': '13.png',
      'Thunderstorm_thunderstorm with light rain': '14.png',
      'Thunderstorm_thunderstorm with rain': '15.png',
      'Thunderstorm_thunderstorm with heavy rain': '16.png',
      'Thunderstorm_light thunderstorm': '17.png',
      'Fog_fog': '9.png' 
    };
  
    let key = `${weatherMain}_${weatherDescription}`;
    if (weatherMain === 'Clear' || (weatherMain === 'Clouds' && weatherDescription.includes('few'))) {
      key += weather.isDay ? '_day' : '_night';
    }
    const iconName = iconMap[key] || '18.png';
    return `https://ocdn.eu/ucs/static/pogoda/578fda62bf6ad47469548f67246cf7fc/mainWidget/png_icons_70/${iconName}`;
  }
  
  selectFilter(filter: string) {
    this.selectedFilter = filter;
  }
}
