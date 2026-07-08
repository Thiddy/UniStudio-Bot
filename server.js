const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    
    try {
        // Calling OpenRouter's completely free AI tier
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3.2-3b-instruct:free", 
                "messages": [
                    { 
                        "role": "system", 
                        "content": "You are UniStudio Bot. Output your response strictly as a JSON object containing two keys: 'luaCode' (a string of Roblox script) and 'threeJSData' (an array of objects with shape, color, and position x, y, z for 3D rendering)." 
                    },
                    { "role": "user", "content": prompt }
                ],
                "response_format": { "type": "json_object" }
            })
        });

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        res.json(JSON.parse(aiMessage));
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('UniStudio Bot running on port 3000'));
