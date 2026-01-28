const API_KEY = `1289192f9968863ca84198a921de7cbd`;
const cityInput = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const errorDiv = document.querySelector("#error");
const weatherInfoDiv = document.querySelector("#weatherInfo");
const cityName = document.querySelector("#cityName");
const condition = document.querySelector("#condition");
const temperature = document.querySelector("#temperature");
const windSpeed = document.querySelector("#windSpeed");
const humidity = document.querySelector("#humidity");
const recentContainer = document.querySelector("#recentSearches");
const clearBtn = document.querySelector("#clearHistory");
const loadingSpinner = document.querySelector("#loading");

// Adding Event Listener to Button
searchBtn.addEventListener("click", fetchWeather);
// Fetch Weather Function 
async function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        displayError("Please Enter City Name");
        return;
        // 1. Show spinner 
    }
    loadingSpinner.classList.remove("hidden");
    weatherInfoDiv.classList.add("hidden");
    errorDiv.style.display = "none";

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("City Not Found");
        }
        const data = await response.json();
        loadingSpinner.classList.add("hidden");
        updateRecentSearches(data.name);
        displayWeather(data);
    } catch (error) {
        loadingSpinner.classList.add("hidden");
        displayError("Incorrect City Name");
    }
}
// Function to update the Recent Searches list
function updateRecentSearches(city) {
    let searches = JSON.parse(localStorage.getItem("recentCities")) || [];
    searches = searches.filter(item => item.toLowerCase() !== city.toLowerCase());
    searches.unshift(city);
    if (searches.length > 5) searches.pop();
    localStorage.setItem("recentCities", JSON.stringify(searches));
    renderRecentButtons();
}
// Function to display the buttons on the screen
function renderRecentButtons() {
    const searches = JSON.parse(localStorage.getItem("recentCities")) || [];
    const clearBtn = document.querySelector("#clearHistory");
    recentContainer.innerHTML = "";

    if (searches.length > 0) {
        clearBtn.classList.add("visible");
    } else {
        clearBtn.classList.remove("visible");
    }
    searches.forEach(city => {
        const btn = document.createElement("button");
        btn.classList.add("recent-btn");
        btn.textContent = city;
        btn.onclick = () => {
            cityInput.value = city;
            fetchWeather();
        };
        recentContainer.appendChild(btn);
    });
}
// Event Listener for "Enter" key
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        fetchWeather();
    }
});
function displayError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    weatherInfoDiv.classList.add("hidden");
}
function displayWeather(data) {
    errorDiv.style.display = "none";
    weatherInfoDiv.classList.remove("hidden");
    cityName.textContent = data.name;

    const mainWeather = data.weather[0].main;
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-showers-heavy',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt-lightning',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Haze': 'fa-smog',
        'fog': 'fa-smog',
        'Smoke': 'fa-smog' 
        
    };
    const iconClass = iconMap[mainWeather] || 'fa-cloud';

    switch (mainWeather) {
        case 'Clear':
            document.body.style.backgroundImage = "url(asset/clearsunny.avif)";
            break;
        case 'Clouds':
            document.body.style.backgroundImage = "url(asset/clouds.avif)";
            break;
        case 'Rain':
        case 'Drizzle':
            document.body.style.backgroundImage = "url(asset/rain.jpg)";
            break;
        case 'Thunderstorm':
            document.body.style.backgroundImage = "url(asset/thunder.jpg)";
            break;
        case 'Snow':
            document.body.style.backgroundImage = "url(asset/snow.jpg)";
            break;
        case 'Mist':
        case 'Haze':
        case 'fog':
        case 'Smoke': 
            document.body.style.backgroundImage = "url(asset/haze.avif)";
            break;
        default:
            document.body.style.background = "linear-gradient (to right, #064656, #76d6eb)";
            break;
    }
    const weatherCodition = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    condition.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${weatherCodition}`;
    temperature.textContent = data.main.temp;
    windSpeed.textContent = data.wind.speed;
    humidity.textContent = data.main.humidity;

}

document.querySelector("#clearHistory").addEventListener("click", () => {
    localStorage.removeItem("recentCities");
    renderRecentButtons();
});

function getLocalWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            loadingSpinner.classList.remove("hidden");
            weatherInfoDiv.classList.add("hidden");
              
           const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Location not found");
                const data = await response.json();
                
                loadingSpinner.classList.add("hidden");
                displayWeather(data);
            } catch (error) {
                loadingSpinner.classList.add("hidden");
                displayError("Could not fetch weather for your location.");
            }
        }, (error) => {
            console.warn("User denied geolocation or error occurred.");
        });
    }
}

window.addEventListener("load", () => {
    renderRecentButtons();
    getLocalWeather(); 
    console.log("App ready. Fetching local weather...");
});
