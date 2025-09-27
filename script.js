
const apiKey = 'd4802a507fc517df6643c61020355773'; // User's OpenWeatherMap API key

function displayWeather(data) {
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
    document.getElementById('condition').textContent = `Condition: ${data.weather[0].description}`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind').textContent = `Wind: ${Math.round(data.wind.speed)} m/s`;
    // Show weather icon
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const iconImg = document.getElementById('weather-icon');
    if (iconImg) {
        iconImg.src = iconUrl;
        iconImg.alt = data.weather[0].description;
        iconImg.style.display = 'block';
    }
}

function displayForecast(forecastData) {
    if (!forecastData || !forecastData.list) return;
    // Show a simple 3-hour forecast for the next 3 periods
    let forecastText = 'Forecast:';
    for (let i = 0; i < 3; i++) {
        const item = forecastData.list[i];
        const date = new Date(item.dt * 1000);
        forecastText += `\n${date.getHours()}:00 - ${Math.round(item.main.temp)}°C, ${item.weather[0].description}`;
    }
    document.getElementById('forecast').textContent = forecastText;
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = show ? 'block' : 'none';
}

function fetchWeather(lat, lon) {
    showLoading(true);
    Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`).then(res => res.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`).then(res => res.json())
    ]).then(([weather, forecast]) => {
        displayWeather(weather);
        displayForecast(forecast);
        showLoading(false);
    }).catch(() => {
        showLoading(false);
    });
}

function fetchWeatherByCity(city) {
    showLoading(true);
    Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`).then(res => res.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`).then(res => res.json())
    ]).then(([weather, forecast]) => {
        if (weather.cod === 200) {
            displayWeather(weather);
            displayForecast(forecast);
        } else {
            document.getElementById('location').textContent = 'City not found.';
            document.getElementById('temperature').textContent = '';
            document.getElementById('condition').textContent = '';
            document.getElementById('forecast').textContent = '';
            document.getElementById('humidity').textContent = '';
            document.getElementById('wind').textContent = '';
            const iconImg = document.getElementById('weather-icon');
            if (iconImg) iconImg.style.display = 'none';
        }
        showLoading(false);
    }).catch(() => {
        document.getElementById('location').textContent = 'Error fetching weather.';
        document.getElementById('temperature').textContent = '';
        document.getElementById('condition').textContent = '';
        document.getElementById('forecast').textContent = '';
        document.getElementById('humidity').textContent = '';
        document.getElementById('wind').textContent = '';
        const iconImg = document.getElementById('weather-icon');
        if (iconImg) iconImg.style.display = 'none';
        showLoading(false);
    });
}

function getLocationAndWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                fetchWeather(pos.coords.latitude, pos.coords.longitude);
            },
            err => {
                document.getElementById('location').textContent = 'Location access denied.';
                document.getElementById('temperature').textContent = '';
                document.getElementById('condition').textContent = '';
                document.getElementById('forecast').textContent = '';
                document.getElementById('humidity').textContent = '';
                document.getElementById('wind').textContent = '';
                const iconImg = document.getElementById('weather-icon');
                if (iconImg) iconImg.style.display = 'none';
            }
        );
    } else {
    document.getElementById('location').textContent = 'Geolocation not supported.';
    document.getElementById('temperature').textContent = '';
    document.getElementById('condition').textContent = '';
    document.getElementById('forecast').textContent = '';
    document.getElementById('humidity').textContent = '';
    document.getElementById('wind').textContent = '';
    const iconImg = document.getElementById('weather-icon');
    if (iconImg) iconImg.style.display = 'none';
    }
}

document.getElementById('refresh').addEventListener('click', getLocationAndWeather);

// window.onload = getLocationAndWeather; (removed duplicate)

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
if (searchBtn && cityInput) {
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        }
    });
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                fetchWeatherByCity(city);
            }
        }
    });
}

window.onload = getLocationAndWeather;
