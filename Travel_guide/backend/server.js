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

// Function to correct Wikimedia Commons Image URLs
const correctImageUrl = async (placeName) => {
    try {
        const searchResponse = await axios.get(
            `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=600&titles=${encodeURIComponent(placeName)}`
        );

        const pages = searchResponse.data.query.pages;
        const pageId = Object.keys(pages)[0]; // Get first result
        const imageUrl = pages[pageId]?.thumbnail?.source;

        return imageUrl || "";
    } catch (error) {
        console.error("Error fetching Wikimedia image:", error.message);
        return "";
    }
};

// Travel Guide API
app.post("/api/travel-guide", async (req, res) => {
    const { place, members, budget, foodIncluded } = req.body;

    if (!place || !members || !budget) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // AI Prompt for Gemini API
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `Suggest at least 6 hotels in ${place} for ${members} people within a budget of ₹${budget}.
                            Each hotel should include:
                            - Hotel name
                            - Location
                            - Contact phone number
                            - Pricing (with/without food)
                            - Food availability (true/false)

                            Ensure the response is **pure JSON** with no extra text. Example:
                            {
                                "hotels": [
                                    {
                                        "name": "Hotel XYZ",
                                        "location": "Place ABC",
                                        "phone": "+91 6374733801",
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

        // Fetch hotel recommendations from Gemini AI
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            requestBody,
            { headers: { "Content-Type": "application/json" } }
        );

        let generatedText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) throw new Error("Empty response from AI");

        // Clean AI response (Remove unwanted JSON format issues)
        generatedText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
        const hotelsData = JSON.parse(generatedText);

        if (!hotelsData.hotels || !Array.isArray(hotelsData.hotels) || hotelsData.hotels.length < 6) {
            throw new Error("Less than 6 hotels returned");
        }

        // ✅ Dynamically Generate Correct Google Maps Links
        hotelsData.hotels = hotelsData.hotels.map((hotel) => ({
            ...hotel,
            mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + hotel.location)}`,
        }));

        // Get Wikimedia image URL dynamically
        const imageUrl = await correctImageUrl(place);

        // Fetch weather details
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${WEATHER_API_KEY}&units=metric`
        );

        const weather = {
            temp: weatherResponse.data.main.temp,
            description: weatherResponse.data.weather[0].description,
            humidity: weatherResponse.data.main.humidity,
        };

        res.json({
            hotels: hotelsData.hotels,
            weather,
            imageUrl
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Failed to fetch travel recommendations" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
