import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import "dotenv/config";
import { SpeedInsights } from "@vercel/speed-insights/next"

function getWeatherDescription(code, isday = 1) {
    const descriptions = {
        1000: isday === 1 ? "Sunny" : "Clear",
        1003: "Partly cloudy",
        1006: "Cloudy",
        1009: "Overcast",
        1030: "Mist",
        1063: "Patchy rain possible",
        1066: "Patchy snow possible",
        1069: "Patchy sleet possible",
        1072: "Patchy freezing drizzle possible",
        1087: "Thundery outbreaks possible",
        1114: "Blowing snow",
        1117: "Blizzard",
        1135: "Fog",
        1147: "Freezing fog",
        1150: "Patchy light drizzle",
        1153: "Light drizzle",
        1168: "Freezing drizzle",
        1171: "Heavy freezing drizzle",
        1180: "Patchy light rain",
        1183: "Light rain",
        1186: "Moderate rain at times",
        1189: "Moderate rain",
        1192: "Heavy rain at times",
        1195: "Heavy rain",
        1198: "Light freezing rain",
        1201: "Moderate or heavy freezing rain",
        1204: "Light sleet",
        1207: "Moderate or heavy sleet",
        1210: "Patchy light snow",
        1213: "Light snow",
        1216: "Patchy moderate snow",
        1219: "Moderate snow",
        1222: "Patchy heavy snow",
        1225: "Heavy snow",
        1237: "Ice pellets",
        1240: "Light rain shower",
        1243: "Moderate or heavy rain shower",
        1246: "Torrential rain shower",
        1249: "Light sleet showers",
        1252: "Moderate or heavy sleet showers",
        1255: "Light snow showers",
        1258: "Moderate or heavy snow showers",
        1261: "Light showers of ice pellets",
        1264: "Moderate or heavy showers of ice pellets",
        1273: "Patchy light rain with thunder",
        1276: "Moderate or heavy rain with thunder",
        1279: "Patchy light snow with thunder",
        1282: "Moderate or heavy snow with thunder"
    };

    return descriptions[code] || "Unknown Weather";
}

function getimg(code, isday) {
    let imageName = "";

    const cloudyCodes = [1003, 1006, 1009, 1030, 1135, 1147];
    const rainCodes = [1063, 1072, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246];
    const snowCodes = [1066, 1069, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264];
    const thunderCodes = [1087, 1273, 1276, 1279, 1282];

    if (code === 1000) {
        imageName = "clear";
    } else if (cloudyCodes.includes(code)) {
        imageName = "cloudy";
    } else if (rainCodes.includes(code)) {
        imageName = "rainy";
    } else if (snowCodes.includes(code)) {
        imageName = "snow";
    } else if (thunderCodes.includes(code)) {
        imageName = "thunderstorm";
    } else {
        imageName = "clear"; // Fallback for unknown codes
    }

    return isday === 1 ? `${imageName}-day.jpg` : `${imageName}-night.jpg`;
}

const app = express();
const port = process.env.PORT || 3000;
const key = process.env.WEATHER_API_KEY;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/weather-place", async (req, res) => {
    try{
        const place = req.query.place;
        const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${key}&q=${place}&aqi=no`);
        const data = response.data;
        const current = data.current;
        const location = data.location.name + ", " + data.location.region + ", " + data.location.country;
        res.render("index", { 
            city: location, 
            current: current,
            description: getWeatherDescription(current.condition.code, current.is_day),
            bgImage: getimg(current.condition.code, current.is_day)
        });
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        res.status(500).send("Error fetching weather data. Please try again later.");
    }
});
app.get("/weather", async (req, res)=>{
    try {
        const { lat, lon } = req.query;
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${key}&q=${latitude},${longitude}&aqi=no`);
        const data = response.data;
        const current = data.current;
        const location = data.location.name + ", " + data.location.region + ", " + data.location.country;
        res.render("index", { 
            city: location, 
            current: current,
            description: getWeatherDescription(current.condition.code, current.is_day),
            bgImage: getimg(current.condition.code, current.is_day)
        });
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        res.status(500).send("Error fetching weather data. Please try again later.");
    }
})
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
