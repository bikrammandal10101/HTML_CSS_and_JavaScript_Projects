// API Configuration
const API_KEY = 'Enter your API key'; // Your API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Weather icon mapping
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

// Enhanced fallback data with more cities
const fallbackWeatherData = {
    'mumbai': {
        name: 'Mumbai', country: 'IN', temp: 28, feels_like: 32,
        humidity: 78, pressure: 1013, wind_speed: 12,
        description: 'partly cloudy', icon: '⛅'
    },
    'delhi': {
        name: 'Delhi', country: 'IN', temp: 35, feels_like: 40,
        humidity: 45, pressure: 1010, wind_speed: 8,
        description: 'sunny', icon: '☀️'
    },
    'bangalore': {
        name: 'Bangalore', country: 'IN', temp: 24, feels_like: 26,
        humidity: 65, pressure: 1015, wind_speed: 6,
        description: 'pleasant', icon: '🌤️'
    },
    'kolkata': {
        name: 'Kolkata', country: 'IN', temp: 30, feels_like: 35,
        humidity: 80, pressure: 1012, wind_speed: 10,
        description: 'humid', icon: '🌫️'
    },
    'chennai': {
        name: 'Chennai', country: 'IN', temp: 32, feels_like: 38,
        humidity: 75, pressure: 1011, wind_speed: 15,
        description: 'hot and humid', icon: '🌡️'
    },
    'london': {
        name: 'London', country: 'UK', temp: 15, feels_like: 13,
        humidity: 70, pressure: 1020, wind_speed: 18,
        description: 'rainy', icon: '🌧️'
    },
    'new york': {
        name: 'New York', country: 'US', temp: 22, feels_like: 25,
        humidity: 60, pressure: 1016, wind_speed: 12,
        description: 'clear', icon: '🌤️'
    },
    'tokyo': {
        name: 'Tokyo', country: 'JP', temp: 26, feels_like: 28,
        humidity: 68, pressure: 1014, wind_speed: 8,
        description: 'partly cloudy', icon: '⛅'
    },
    'paris': {
        name: 'Paris', country: 'FR', temp: 18, feels_like: 16,
        humidity: 65, pressure: 1018, wind_speed: 14,
        description: 'cloudy', icon: '☁️'
    },
    'sydney': {
        name: 'Sydney', country: 'AU', temp: 21, feels_like: 23,
        humidity: 55, pressure: 1022, wind_speed: 20,
        description: 'windy', icon: '💨'
    }
};

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherInfo = document.getElementById('weatherInfo');
const defaultMessage = document.getElementById('defaultMessage');

function hideAllSections() {
    loading.classList.remove('show');
    error.classList.remove('show');
    weatherInfo.classList.remove('show');
    defaultMessage.style.display = 'none';
}

function formatDate() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return now.toLocaleDateString('en-US', options);
}

function displayWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.country}`;
    document.getElementById('currentDate').textContent = formatDate();
    document.getElementById('weatherIcon').textContent = data.icon;
    document.getElementById('temperature').textContent = `${data.temp}°C`;
    document.getElementById('description').textContent = data.description;
    document.getElementById('feelsLike').textContent = `${data.feels_like}°C`;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind_speed} km/h`;
    document.getElementById('pressure').textContent = `${data.pressure} hPa`;
}

// Real API function with CORS proxy
async function fetchWeatherFromAPI(city) {
    try {
        // Using CORS proxy for API calls
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const url = proxyUrl + encodeURIComponent(apiUrl);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();

        // Check if API returned error
        if (data.cod && data.cod !== 200) {
            throw new Error(data.message || 'City not found');
        }

        return {
            name: data.name,
            country: data.sys.country,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            wind_speed: Math.round(data.wind.speed * 3.6), // m/s to km/h
            description: data.weather[0].description,
            icon: weatherIcons[data.weather[0].icon] || '🌤️'
        };
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        return;
    }

    hideAllSections();
    loading.classList.add('show');

    try {
        // Try real API first (with retry mechanism)
        let weatherData;
        let apiSuccess = false;

        try {
            weatherData = await fetchWeatherFromAPI(city);
            apiSuccess = true;
        } catch (apiError) {
            console.log('API failed, using fallback data');
            // If API fails, use fallback data
            const cityLower = city.toLowerCase();
            if (fallbackWeatherData[cityLower]) {
                weatherData = fallbackWeatherData[cityLower];
            } else {
                throw new Error('City not found in fallback data');
            }
        }

        // Show success message for API vs fallback
        setTimeout(() => {
            hideAllSections();
            displayWeather(weatherData);
            weatherInfo.classList.add('show');

            // Add indicator for data source
            const cityNameEl = document.getElementById('cityName');
            if (apiSuccess) {
                cityNameEl.innerHTML = `${weatherData.name}, ${weatherData.country} <span style="font-size:12px;opacity:0.7;">• Live Data</span>`;
            } else {
                cityNameEl.innerHTML = `${weatherData.name}, ${weatherData.country} <span style="font-size:12px;opacity:0.7;">• Demo Data</span>`;
            }
        }, 800);

    } catch (err) {
        setTimeout(() => {
            hideAllSections();
            error.innerHTML = `❌ "${city}" not found!<br><small>Try: Mumbai, Delhi, London, New York, Tokyo, Paris</small>`;
            error.classList.add('show');
        }, 800);
    }
}

searchBtn.addEventListener('click', searchWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Add some interactive background effects
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    document.body.style.background = `linear-gradient(135deg, 
                hsl(${240 + x * 60}, 70%, ${65 + y * 15}%) 0%, 
                hsl(${280 + x * 40}, 60%, ${55 + y * 20}%) 100%)`;
});

// Show default message on load
defaultMessage.style.display = 'block';