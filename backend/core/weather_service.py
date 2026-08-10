import requests
from django.conf import settings

class WeatherService:
    """
    Fetches hyper-local weather data for the Utonga Sanctuary (Bondo, Kenya).
    Uses OpenWeatherMap API.
    """
    API_KEY = getattr(settings, 'OPENWEATHER_API_KEY', None)
    LAT = -0.0917 # Utonga Sanctuary Latitude
    LON = 34.7680  # Utonga Sanctuary Longitude

    @staticmethod
    def get_current_sanctuary_weather():
        if not WeatherService.API_KEY:
            return {
                "temp": 24,
                "condition": "Clear Skies",
                "icon": "01d",
                "advisory": "Perfect day for sanctuary exploration."
            }

        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={WeatherService.LAT}&lon={WeatherService.LON}&appid={WeatherService.API_KEY}&units=metric"
            response = requests.get(url, timeout=5)
            data = response.json()
            
            temp = round(data['main']['temp'])
            condition = data['weather'][0]['main']
            icon = data['weather'][0]['icon']
            humidity = data['main'].get('humidity', 0)
            wind_speed = round(data['wind'].get('speed', 0) * 3.6) # Convert m/s to km/h
            
            # Dynamic advisory logic
            advisory = "Perfect for sanctuary exploration."
            if temp > 28: advisory = "Warm day. Stay hydrated on the trails."
            if "Rain" in condition: advisory = "Wetlands are active. Bring waterproof gear."
            if temp < 20: advisory = "Cool breeze. Ideal for bird watching."

            return {
                "temp": temp,
                "condition": condition,
                "icon": icon,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "advisory": advisory
            }
        except Exception:
            return {
                "temp": 24,
                "condition": "Partly Cloudy",
                "icon": "02d",
                "advisory": "Ideal conditions for forest restoration."
            }
