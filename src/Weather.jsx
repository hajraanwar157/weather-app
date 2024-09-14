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
  const search = async (city) => {
    if (city === "") {
      alert("enter city name");
      return;
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const response = await fetch(url);

      const data = await response.json();
      if (!response.ok) {
        alert(data.message);
        return;
      }
      console.log(data);
      const icon = allIcons[data.weather[0].icon] || clear;
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: icon,
      });
    } catch (error) {
      setWeatherData(false);
    }
  };
  useEffect(() => {
    search("London");
  }, []);
  return (
    <div className="weather">
      <div className="search">
        <input type="text" placeholder="Search" ref={inputRef} />
        <img
          src={search_icon}
          alt="search-icon"
          onClick={() => {
            search(inputRef.current.value);
          }}
        />
      </div>
      {weatherData ? (
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
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Weather;
