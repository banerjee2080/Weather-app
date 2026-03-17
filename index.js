import { fetchWeatherApi } from "openmeteo";
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

function getWeatherDescription(code) {
    if (code === 0) {
        return "Clear Sky";
    } else if (code === 1 || code === 2 || code === 3) {
        return "Mainly Clear to Overcast";
    } else if (code === 45 || code === 48) {
        return "Fog";
    } else if (code === 51 || code === 53 || code === 55) {
        return "Drizzle";
    } else if (code === 56 || code === 57) {
        return "Freezing Drizzle";
    } else if (code === 61 || code === 63 || code === 65) {
        return "Rain";
    } else if (code === 66 || code === 67) {
        return "Freezing Rain";
    } else if (code === 71 || code === 73 || code === 75) {
        return "Snow";
    } else if (code === 77) {
        return "Snow Grains";
    } else if (code === 80 || code === 81 || code === 82) {
        return "Rain Showers";
    } else if (code === 85 || code === 86) {
        return "Snow Showers";
    } else if (code === 95) {
        return "Thunderstorm";
    } else if (code === 96 || code === 99) {
        return "Thunderstorm with Hail";
    } else {
        return "Unknown Weather";
    }
}

function getimg(code, isday){
    if(isday === 1){
        if (code === 0) {
            return "clear-day.jpg";
        } 
        else if (code === 1 || code === 2 || code === 3) {
            return "cloudy-day.jpg";
        } 
        else if (code >= 51 && code <= 67) {
            return "rainy-day.jpg";
         } 
        else if (code >= 71 && code <= 77) {
            return "snow-day.jpg";
        }
        else if (code >= 95 && code <= 99) {
            return "thunderstorm.jpg";
        }
    } 
    else {
        if (code === 0) {
            return "clear-night.jpg";
        } 
        else if (code === 1 || code === 2 || code === 3) {
            return "cloudy-night.jpg";
        } 
        else if (code >= 51 && code <= 67) {
            return "rainy-night.jpg";
         } 
        else if (code >= 71 && code <= 77) {
            return "snow-night.jpg";
        }
        else if (code >= 95 && code <= 99) {
            return "thunderstorm.jpg";
        }
    }        
}

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

const url = "https://api.open-meteo.com/v1/forecast";
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/weather", async (req, res)=>{
    try {
        const { lat, lon } = req.query;
        const params = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            current: ["temperature_2m", "relative_humidity_2m", "rain", "apparent_temperature", "weather_code", "wind_speed_10m", "is_day"].join(',') 
        };
        const name = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
            headers: {
                'User-Agent': 'MyWeatherApp/1.0 (banerjee2110@gmail.com)' 
            }
        });
        const response = await axios.get(url, { params });    
        const data = response.data;
        const current = data.current;

        const bgImageName = getimg(current.weather_code, current.is_day);
        const weatherDesc = getWeatherDescription(current.weather_code);

        console.log(`\nCoordinates: ${data.latitude}°N ${data.longitude}°E`);
        console.log(`\nCity: ${name.data.address.city || name.data.address.town || name.data.address.village}`);
        
        console.log(`\nCurrent time: ${current.time}`);
        console.log(`Current temperature: ${current.temperature_2m}°C`);
        console.log(`Current relative_humidity_2m: ${current.relative_humidity_2m}mm`);
        console.log(`Current rain: ${current.rain}mm`);
        console.log(`Current apparent temperature: ${current.apparent_temperature}°C`);
        console.log(`Current weather code: ${current.weather_code}`);
        console.log(`Current wind speed: ${current.wind_speed_10m} km/h`);

        res.render("index", { 
            city: name.data.address.city || name.data.address.town || name.data.address.village, 
            current: current,
            description: weatherDesc,
            bgImage: bgImageName
        });
    }catch (error) {
        console.error("Error fetching weather data:", error.message);
        res.status(500).send("Error fetching weather data. Please try again later.");
    }
})
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
