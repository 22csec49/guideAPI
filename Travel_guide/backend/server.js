const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/api/travel-guide", async (req, res) => {
    const { place, members, budget, foodIncluded } = req.body;

    if (!place || !members || !budget) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: `Suggest at least 6 hotels in ${place} for ${members} people within a budget of ₹${budget}. 
                        Each hotel should include:
                        - Hotel name
                        - Location
                        - Google Maps link
                        - Contact phone number
                        - Pricing (with/without food)
                        - Food availability (true/false)

                        Ensure the response is **pure JSON** with no extra text. Example:
                        {
                            "hotels": [
                                {
                                    "name": "Hotel XYZ",
                                    "location": "Place ABC",
                                    "mapLink": "https://maps.google.com/...",
                                    "phone": "+91 6374733801",
                                    "price": 5000,
                                    "foodIncluded": ${foodIncluded}
                                },
                                ...
                            ]
                        }`
                    }
                ]
            }
        ]
    };

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
            requestBody,
            { headers: { "Content-Type": "application/json" } }
        );

        let generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) throw new Error("Empty response from API");

        generatedText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const hotelsData = JSON.parse(generatedText);

            if (!hotelsData.hotels || !Array.isArray(hotelsData.hotels) || hotelsData.hotels.length < 5) {
                throw new Error("Less than 6 hotels returned");
            }

            res.json(hotelsData);
        } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError);
            res.status(500).json({ error: "Invalid JSON format from AI response" });
        }
    } catch (error) {
        console.error("Error fetching hotels:", error.message);
        res.status(500).json({ error: "Failed to fetch hotel recommendations" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
