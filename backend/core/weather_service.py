import requests

class WeatherService:
    """
    Fetches hyper-local weather data for the Utonga Sanctuary (Bondo, Kenya).
    Uses Open-Meteo (Free, High-Resolution, No API Key required).
    """
    LAT = -0.0917 # Utonga Sanctuary Latitude
    LON = 34.7680  # Utonga Sanctuary Longitude

    @staticmethod
    def get_current_sanctuary_weather():
        try:
            # Open-Meteo URL with current_weather and extra metrics
            url = f"https://api.open-meteo.com/v1/forecast?latitude=-0.0917&longitude=34.7680&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=Africa%2FNairobi"
            
            response = requests.get(url, timeout=5)
            data = response.json()
            
            current = data['current']
            temp = round(current['temperature_2m'])
            humidity = current['relative_humidity_2m']
            wind_speed = round(current['wind_speed_10m'])
            weather_code = current['weather_code']
            
            # WMO Weather interpretation codes
            # 0 = Clear, 1-3 = Partly Cloudy, 45-48 = Fog, 51-67 = Drizzle/Rain
            condition = "Clear Skies"
            if weather_code > 0 and weather_code <= 3: condition = "Partly Cloudy"
            if weather_code >= 45 and weather_code <= 48: condition = "Foggy"
            if weather_code >= 51 and weather_code <= 67: condition = "Rainy"
            if weather_code >= 71 and weather_code <= 77: condition = "Snowy" # Rare in Bondo!
            if weather_code >= 80: condition = "Stormy"

            # Dynamic advisory logic
            advisory = "Perfect for sanctuary exploration."
            if temp > 28: advisory = "Warm day in Bondo. Stay hydrated on the trails."
            if "Rain" in condition or "Stormy" in condition: advisory = "Wetlands are active. Bring waterproof gear."
            if temp < 20: advisory = "Cool breeze. Ideal for bird watching near the lake."

            return {
                "temp": temp,
                "condition": condition,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "advisory": advisory,
                "provider": "Open-Meteo"
            }
        except Exception as e:
            print(f"Weather Fetch Error: {e}")
            return {
                "temp": 24,
                "condition": "Ideal",
                "humidity": 60,
                "wind_speed": 10,
                "advisory": "Sanctuary conditions are optimal for conservation work.",
                "provider": "Fallback"
            }
