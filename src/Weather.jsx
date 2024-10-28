import React, { useEffect, useRef, useState } from "react";
import "./Weather.css";
import search_icon from "./assets/search.png";
import clear from "./assets/clear.png";
import drizzle from "./assets/drizzle.png";
import humidity from "./assets/humidity.png";
import rain from "./assets/rain.png";
import snow from "./assets/snow.png";
import wind from "./assets/wind.png";
import cloud from "./assets/cloud.png";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
function Weather() {
  const allIcons = {
    "01d": clear,
    "01n": clear,
    "02d": cloud,
    "02n": cloud,
    "03d": cloud,
    "03n": cloud,
    "04d": drizzle,
    "04n": drizzle,
    "09d": rain,
    "09n": rain,
    "10d": rain,
    "10n": rain,
    "13d": snow,
    "13n": snow,
  };
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(false);
  const [forecastData, setForecastData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);
  // Fetch current weather using coordinates
  const fetchWeatherData = (lat, lon) => {
    setLoading(true);
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${
          import.meta.env.VITE_APP_ID
        }&units=metric`
      )
      .then((response) =>
        setWeatherData({
          humidity: response.data.main.humidity,
          windSpeed: response.data.wind.speed,
          temperature: Math.floor(response.data.main.temp),
          location: response.data.name,
          icon: allIcons[response.data.weather[0].icon] || clear,
        })
      )
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  };

  // Fetch 5-day forecast using coordinates
  const fetchForecastData = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${
          import.meta.env.VITE_APP_ID
        }&units=metric`
      );
      processForecastData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Error fetching weather data.");
    } finally {
      setLoading(false);
    }
  };
  const search = (city) => {
    setLoading(true);
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
          import.meta.env.VITE_APP_ID
        }`
      )
      .then((response) =>
        setWeatherData({
          humidity: response.data.main.humidity,
          windSpeed: response.data.wind.speed,
          temperature: Math.floor(response.data.main.temp),
          location: response.data.name,
          icon: allIcons[response.data.weather[0].icon] || clear,
        })
      )
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  };
  const fetchForecastDataByCity = async (cityName) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${
          import.meta.env.VITE_APP_ID
        }&units=metric`
      );
      processForecastData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("City not found. Please try another city.");
    } finally {
      setLoading(false);
    }
  };

  const processForecastData = (data) => {
    const dailyForecast = data.list.reduce((acc, forecast) => {
      const date = new Date(forecast.dt * 1000);
      const dateString = date.toDateString();
      const dayName = date.toLocaleString("en-US", { weekday: "short" });
      const iconCode = allIcons[forecast.weather[0].icon];
      if (!acc[dateString]) {
        acc[dateString] = {
          maxTemp: forecast.main.temp,
          minTemp: forecast.main.temp,
          icon: iconCode,
          day: dayName,
        };
      } else {
        acc[dateString].maxTemp = Math.max(
          acc[dateString].maxTemp,
          forecast.main.temp
        );
        acc[dateString].minTemp = Math.min(
          acc[dateString].minTemp,
          forecast.main.temp
        );
        acc[dateString].icon = iconCode;
      }
      return acc;
    }, {});

    const forecastArray = Object.keys(dailyForecast)
      .map((date) => ({
        date,
        ...dailyForecast[date],
      }))
      .slice(0, 5);

    setForecastData(forecastArray);
  };
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);
  // Fetch weather based on location coordinates
  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchWeatherData(location.latitude, location.longitude);
      fetchForecastData(location.latitude, location.longitude);
    }
  }, [location]);

  return (
    <div className="weather">
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <div className="search">
            <input type="text" placeholder="Search" ref={inputRef} />
            <img
              src={search_icon}
              alt="search-icon"
              onClick={(e) => {
                search(inputRef.current.value);
                fetchForecastDataByCity(inputRef.current.value);
              }}
            />
          </div>
          {weatherData && forecastData ? (
            <>
              <img
                src={weatherData.icon}
                alt="weather-icon"
                className="weather-icon"
              />
              <p className="temperature">{weatherData.temperature}&deg;c</p>
              <p className="location">{weatherData.location}</p>
              <div className="weather-data">
                <div className="col">
                  <img src={humidity} alt="humidity-icon" />
                  <div>
                    <p>{weatherData.humidity} %</p>
                    <span>Humidity</span>
                  </div>
                </div>

                <div className="col">
                  <img src={wind} alt="wind-icon" />
                  <div>
                    <p>{weatherData.windSpeed} km/h</p>
                    <span>Wind Speed</span>
                  </div>
                </div>
              </div>
              <h1 className="forecast-heading">5 days Weather forecast</h1>
              <div className="forecast">
                {forecastData.map((forecast, index) => (
                  <div key={index} className="forecast-day">
                    <div>
                      <p>{forecast.day}</p>
                      <img src={forecast.icon} alt="icon" />
                    </div>
                    <div>
                      <p>High: {forecast.maxTemp} °C</p>
                      <p>Low: {forecast.minTemp} °C</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
}

export default Weather;
