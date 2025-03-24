const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";

// Fetch coordinates for a given city
const fetchCoordinates = async (city) => {
    try {
        const response = await axios.get(NOMINATIM_API_URL, {
            params: { q: city, format: "json", limit: 1 },
        });

        if (response.data.length === 0) throw new Error("Location not found");

        return {
            lat: response.data[0].lat,
            lon: response.data[0].lon,
        };
    } catch (error) {
        console.error("Error fetching coordinates:", error.message);
        return null;
    }
};

// Fetch tourist places near the location
const fetchTopTouristPlaces = async (lat, lon) => {
    try {
        const response = await axios.get(
            `https://en.wikipedia.org/w/api.php?action=query&format=json&list=geosearch&gscoord=${lat}|${lon}&gsradius=10000&gslimit=5`
        );

        return response.data.query.geosearch.map((place) => place.title);
    } catch (error) {
        console.error("Error fetching tourist places:", error.message);
        return [];
    }
};

// Fetch images for each place
const fetchImageForPlace = async (place) => {
    try {
        const response = await axios.get(
            `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=500&titles=${encodeURIComponent(place)}`
        );

        const pages = response.data.query.pages;
        const page = Object.values(pages)[0];

        return page.thumbnail ? page.thumbnail.source : null;
    } catch (error) {
        console.error(`Error fetching image for ${place}:`, error.message);
        return null;
    }
};

// Fetch weather details
const fetchWeather = async (city) => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );

        return {
            temp: response.data.main.temp,
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
        };
    } catch (error) {
        console.error("Error fetching weather:", error.message);
        return null;
    }
};

// Travel Guide API
app.post("/api/travel-guide", async (req, res) => {
    const { place, members, budget, foodIncluded } = req.body;

    if (!place || !members || !budget) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Get coordinates of the place
        const coordinates = await fetchCoordinates(place);
        if (!coordinates) {
            return res.status(400).json({ error: "Invalid location" });
        }

        // Fetch tourist places near the coordinates
        const topPlaces = await fetchTopTouristPlaces(coordinates.lat, coordinates.lon);
        const placeData = await Promise.all(
            topPlaces.map(async (name) => ({
                name,
                image: await fetchImageForPlace(name),
            }))
        );

        // Generate hotel recommendations using Gemini AI
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `Suggest 6 hotels in ${place} for ${members} people within ₹${budget}.
                            Each hotel should have:
                            - Name
                            - Location
                            - Contact number
                            - Pricing with/without food
                            - Food availability (true/false)
                            
                            Respond in **pure JSON** like this:
                            {
                                "hotels": [
                                    {
                                        "name": "Hotel ABC",
                                        "location": "XYZ",
                                        "phone": "+91 9876543210",
                                        "price": {
                                            "withFood": 5000,
                                            "withoutFood": 4000
                                        },
                                        "foodIncluded": ${foodIncluded}
                                    }
                                ]
                            }`
                        }
                    ]
                }
            ]
        };

        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            requestBody,
            { headers: { "Content-Type": "application/json" } }
        );

        let generatedText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) throw new Error("Invalid AI response");

        generatedText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
        const hotelsData = JSON.parse(generatedText);

        if (!hotelsData.hotels || hotelsData.hotels.length < 6) {
            throw new Error("Insufficient hotel data");
        }

        // Append Google Maps links
        hotelsData.hotels = hotelsData.hotels.map((hotel) => ({
            ...hotel,
            mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + hotel.location)}`,
        }));

        // Fetch weather details
        const weather = await fetchWeather(place);

        res.json({
            hotels: hotelsData.hotels,
            weather,
            topTouristPlaces: placeData.filter((p) => p.image),
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Failed to fetch travel recommendations" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
