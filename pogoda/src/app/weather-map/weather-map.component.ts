import { AfterViewInit, Component, OnInit } from '@angular/core';
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
  
  weatherData: { city: string, temp: number, weather_main: string, weather_description: string }[] = [];
  errorMessage: string | null = null;
  selectedFilter: string = ''; 
  units: string = 'metric'; 
  isMetric: boolean = true; 

  constructor(private weatherService: WeatherService) {
    this.fetchWeatherData();
  }

  ngOnInit(): void {
    this.selectedFilter = 'temp';
  }

  fetchWeatherData(): void {
    this.weatherData = []; // Reset weather data before fetching new
    this.cities.forEach(city => {
      this.weatherService.getWeatherByCoordinates(city.lat, city.lon, this.units).subscribe({
        next: (data) => {
          if (data.weather && data.weather.length > 0) {
            const weatherMain = data.weather[0].main || "Unknown";
            const weatherDescription = data.weather[0].description || "No description";

            this.weatherData.push({
              city: city.name,
              temp: Math.floor(data.main.temp),
              weather_main: weatherMain,
              weather_description: weatherDescription,
            });
          } else {
            console.warn(`No weather data found for ${city.name}`);
          }
        },
        error: (err) => {
          this.errorMessage = `Error fetching weather data for ${city.name}: ${err}`;
          console.error(this.errorMessage);
        }
      });
    });
  }

  changeUnits(newUnits: string): void {
    this.units = newUnits;
    this.isMetric = (newUnits === 'metric'); 
    this.fetchWeatherData(); 
  }

  getTemperature(cityName: string): number | null {
    const cityWeather = this.weatherData.find(item => item.city === cityName);
    return cityWeather ? cityWeather.temp : null;
  }

  getTemperatureUnit(): string {
    return this.isMetric ? '°C' : '°F'; 
  }

  getWeatherIcon(cityName: string): string {
    const weather = this.weatherData.find(item => item.city === cityName);
    if (!weather) return ''; 

    const weatherMain = weather.weather_main;
    const weatherDescription = weather.weather_description.toLowerCase();

    const iconMap: { [key: string]: string } = {
      'Clear_clear sky': '1.png',
      'Clouds_few clouds': '2.png',
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
      'Thunderstorm_light thunderstorm': '17.png'
    };

    const key = `${weatherMain}_${weatherDescription}`;
    const iconName = iconMap[key] || '18.png'; 

    return `//ocdn.eu/ucs/static/pogoda/578fda62bf6ad47469548f67246cf7fc/mainWidget/png_icons_70/${iconName}`;
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
  }

}
