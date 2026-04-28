# NutriScan AI 🌿⬡

**AI-powered food nutrition analysis website**

> Upload a food photo or search any food to instantly see calories, macros, vitamins, minerals, health score, benefits, warnings, and track your daily intake.

---

## 📁 Project Structure

```
nutriscan/
├── index.html      — Main HTML structure (all sections, modals, layout)
├── style.css       — Complete styling (dark/light mode, glassmorphism, animations)
├── script.js       — Application logic (AI analyzer, search, daily log, rendering)
├── data.json       — Food nutrition database (15 foods, daily values, health guide)
└── README.md       — This file
```

---

## 🚀 How to Run

### Option 1 — Open directly (simplest)
1. Download all files into a single folder.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).

> ⚠️ **Note:** Fetching `data.json` requires a local server when running from the filesystem on some browsers (due to CORS restrictions). Use Option 2 if the food database doesn't load.

### Option 2 — Local development server (recommended)

**Using Python:**
```bash
cd nutriscan/
python3 -m http.server 8080
# Visit: http://localhost:8080
```

**Using Node.js (npx):**
```bash
cd nutriscan/
npx serve .
# Visit: http://localhost:3000
```

**Using VS Code:**
Install the **Live Server** extension, right-click `index.html` → "Open with Live Server".

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 Image Upload | Drag & drop or click to upload food photos |
| 📷 Camera Capture | Use device camera to capture food photo |
| 🤖 AI Analysis | Simulated AI food identification with loading animation |
| 🔍 Food Search | Real-time search with suggestions and quick picks |
| 📊 Full Nutrition | Calories, protein, carbs, fat, fiber, sugar, vitamins, minerals |
| 🏆 Health Score | 0–100 score with animated ring and tier classification |
| ✅ Benefits | Health benefits listed per food |
| ⚠️ Warnings | Cautions and dietary warnings per food |
| 🍽️ Portion Size | Adjustable serving size (0.5x to 10x) with live recalculation |
| 📅 Daily Log | Add foods to daily tracker with totals vs. daily values |
| 🌙 Dark/Light Mode | Toggle with system preference persistence |
| 📱 Responsive | Fully responsive for mobile, tablet, and desktop |

---

## 🧠 Connecting a Real AI Vision API

The `AIAnalyzer` object in `script.js` is structured for easy API replacement.

### Current (simulated):
```javascript
async analyze(imageDataURL, foodDatabase) {
  await this._simulateAnalysis(); // fake delay
  return this._pickRandomFood(foodDatabase); // random food
}
```

### Replace with OpenAI GPT-4o Vision:
```javascript
async analyze(imageDataURL, foodDatabase) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer YOUR_API_KEY`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageDataURL } },
          {
            type: 'text',
            text: 'Identify the food in this image. Reply with ONLY a JSON object: { "food": "food name" }'
          }
        ]
      }],
      max_tokens: 100
    })
  });
  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return this.matchFoodByName(parsed.food, foodDatabase);
}
```

### Replace with Google Gemini Vision:
```javascript
async analyze(imageDataURL, foodDatabase) {
  const base64Data = imageDataURL.split(',')[1];
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'image/jpeg', data: base64Data } },
            { text: 'Identify the food in this image. Reply ONLY with JSON: { "food": "food name" }' }
          ]
        }]
      })
    }
  );
  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const parsed = JSON.parse(text);
  return this.matchFoodByName(parsed.food, foodDatabase);
}
```

### Replace with Nutritionix API (for nutrition data too):
```javascript
async analyze(imageDataURL, foodDatabase) {
  // Use Nutritionix natural language or image endpoint
  // https://www.nutritionix.com/business/api
  const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    method: 'POST',
    headers: {
      'x-app-id': 'YOUR_APP_ID',
      'x-app-key': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: 'identified food name from vision API' })
  });
  // Parse and map to your food schema
}
```

---

## 📊 Adding More Foods to the Database

Edit `data.json` and add an entry to the `foods` array:

```json
{
  "id": 16,
  "name": "Salmon",
  "aliases": ["salmon", "grilled salmon", "baked salmon", "atlantic salmon"],
  "category": "seafood",
  "emoji": "🐟",
  "servingSize": 198,
  "servingUnit": "g (1 fillet)",
  "healthScore": 95,
  "nutrition": {
    "calories": 412,
    "protein": 45,
    "carbohydrates": 0,
    "fat": 24,
    "fiber": 0,
    "sugar": 0,
    "sodium": 114,
    "potassium": 970,
    "calcium": 34,
    "iron": 1.6,
    "vitaminC": 0,
    "vitaminA": 58,
    "cholesterol": 109
  },
  "benefits": [
    "Extremely high in omega-3 fatty acids",
    "Excellent protein for muscle recovery",
    "Rich in B vitamins and selenium"
  ],
  "warnings": [
    "Mercury content — limit to 2–3 servings per week",
    "Farm-raised salmon may have more contaminants than wild-caught"
  ]
}
```

---

## 🎨 Customization

### Change accent color:
In `style.css`, update `--accent`:
```css
:root {
  --accent: #ff6b6b;     /* Red theme */
  --accent: #7c6aff;     /* Purple theme */
  --accent: #00d4aa;     /* Teal (default) */
}
```

### Add a new nutrient row:
In `script.js`, add to `NutritionRenderer._rows`:
```javascript
{ key: 'vitaminD', label: 'Vitamin D', unit: 'mcg', icon: '☀️', dvKey: 'vitaminD', color: '#fcd34d' }
```
And add the matching `vitaminD` value to each food in `data.json` and to `dailyValues`.

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 90+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Opera 78+ | ✅ Full |

---

## ⚠️ Disclaimer

> Nutrition values displayed are **AI estimates** based on a reference database and may not reflect the exact nutritional content of specific brands, preparation methods, or food varieties. This tool is for **educational and informational purposes only** and is **not a substitute for advice from a registered dietitian or healthcare professional**.

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

*Built with ❤ for healthier living*
