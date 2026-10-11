# 📡 AgriMate AI — Backend API Documentation

The AgriMate AI backend is a TypeScript Node.js/Express service providing secure API endpoints for authentication, AI diagnostics, weather data, crop tracking, task management, and soil guidance.

Base URL: `http://localhost:4000` (configurable via `PORT` environment variable)

All protected routes require an `Authorization: Bearer <token>` header.

---

## 1. System Health & Diagnostics

### `GET /api/health`
Checks backend service availability and Gemini connectivity status.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "AgriMate AI Backend Service",
  "gemini_connected": true,
  "timestamp": "2026-10-11T06:39:02.319Z"
}
```

---

## 2. AI Agricultural Services

### `POST /api/ai/chat` *(Protected)*
Sends a farmer query to the Google Gemini Agricultural Assistant.

**Request Body:**
```json
{
  "message": "Why are my tomato leaves turning yellow?",
  "conversation_id": "conv_123",
  "context": {
    "cropName": "Roma Tomato",
    "growthStage": "Vegetative",
    "location": "Central Valley",
    "preferredLanguage": "en"
  }
}
```

**Response `200 OK`:**
```json
{
  "conversation_id": "conv_123",
  "answer": "Yellowing leaves on crops are typically caused by...",
  "cautions": [
    "Always check manufacturer label instructions before applying treatments.",
    "Wear protective gloves when spraying."
  ],
  "follow_up_suggestions": [
    "How do I tell if my soil drains well?",
    "What are organic sources of nitrogen?"
  ],
  "disclaimer": "AgriMate guidance is educational. Consult local agricultural extension officers for region-specific certifications and commercial dosing."
}
```

---

### `POST /api/ai/diagnose` *(Protected)*
Analyzes a photographed leaf or plant issue using multimodal vision. Supports `multipart/form-data` with an image file or JSON body with `imageBase64`.

**Request Body (JSON):**
```json
{
  "imageBase64": "<base64_encoded_image>",
  "mimeType": "image/jpeg",
  "cropHint": "Roma Tomato",
  "symptoms": "Brown concentric circular spots with yellow halos."
}
```

**Response `201 Created`:**
```json
{
  "id": "analysis_1791700765636",
  "user_id": "00000000-0000-0000-0000-000000000001",
  "crop_identification": "Roma Tomato",
  "symptoms": "Concentric brown to black circular lesions observed with subtle yellow chlorotic halo on foliage.",
  "possible_causes": [
    "Early Blight (Alternaria solani) — Highly Likely",
    "Septoria Leaf Spot — Probable Secondary Alternative"
  ],
  "confidence_level": "Moderate",
  "uncertainty_notes": "Image clarity and leaf-underside visibility limit absolute confirmation. Laboratory microscopic inspection is required for 100% certainty.",
  "recommendations": [
    "Prune and discard infected lower leaves immediately (do NOT compost diseased leaves).",
    "Water solely at the soil base — avoid splashing water onto foliage.",
    "Apply an organic copper-based or bio-fungicide according to label instructions during cool morning hours."
  ],
  "prevention_methods": [
    "Practice a 3-year crop rotation avoiding nightshades.",
    "Increase plant spacing to ensure rapid leaf drying after rain."
  ],
  "expert_referral_guidance": "If lesions spread to the main stem or affect more than 25% of plants within 3 days, consult your regional agricultural extension officer for diagnostic verification.",
  "created_at": "2026-10-11T06:39:25.636Z"
}
```

---

## 3. Real Weather & Geocoding

### `GET /api/weather`
Fetches real Open-Meteo observations, hourly forecast, and agricultural advisories.

**Query Parameters:**
- `lat` (number, required): Latitude (e.g. `36.6777`)
- `lon` (number, required): Longitude (e.g. `-121.6555`)
- `location_name` (string, optional): Display region name (e.g. `Salinas Valley`)

**Response `200 OK`:**
```json
{
  "location_name": "Salinas Valley",
  "latitude": 36.6777,
  "longitude": -121.6555,
  "fetched_at": "2026-10-11T06:39:02.000Z",
  "current": {
    "temperature": 18.2,
    "apparent_temperature": 17.5,
    "relative_humidity": 65,
    "precipitation": 0,
    "precipitation_probability": 5,
    "wind_speed": 7.8,
    "weather_code": 0,
    "weather_description": "Clear sky"
  },
  "farming_advisory": {
    "irrigation_advice": "Normal watering recommended based on topsoil moisture.",
    "spraying_suitability": "Favorable",
    "spraying_advice": "Calm winds and clear skies make this a safe spraying window.",
    "fieldwork_suitability": "Favorable"
  }
}
```

### `GET /api/weather/geocode`
Searches global locations by name for manual location selection.

**Query Parameters:**
- `query` (string, required): City or farm region name (e.g. `Salinas`)

---

## 4. Crops Management

### `GET /api/crops` *(Protected)*
Lists all crops for the authenticated user. Optional `?status=Active|Harvested|Archived`.

### `POST /api/crops` *(Protected)*
Creates a new crop record.

**Request Body:**
```json
{
  "crop_name": "San Marzano Tomatoes",
  "variety": "Determinate",
  "plot_size": 1.5,
  "plot_size_unit": "acres",
  "planting_date": "2026-03-15",
  "expected_harvest_date": "2026-07-20",
  "growth_stage": "Vegetative",
  "status": "Active",
  "notes": "Mulched with rice straw."
}
```

### `PUT /api/crops/:id` *(Protected)*
Updates crop details.

### `DELETE /api/crops/:id` *(Protected)*
Deletes the crop record.

---

## 5. Farming Tasks & Reminders

### `GET /api/tasks` *(Protected)*
Lists user tasks. Supports `?filter=today|upcoming|all` and `?status=Pending|Completed`.

### `POST /api/tasks` *(Protected)*
Creates a farming task.

**Request Body:**
```json
{
  "crop_id": "crop_123",
  "crop_name": "Roma Tomatoes",
  "title": "Morning Drip Irrigation",
  "task_type": "Watering",
  "priority": "High",
  "scheduled_at": "2026-03-20T08:00:00Z",
  "description": "Run zone 1 irrigation for 30 minutes."
}
```

### `PATCH /api/tasks/:id/complete` *(Protected)*
Marks a task as completed with current timestamp.

---

## 6. Soil & Fertilizer Guidance

### `POST /api/soil/advice`
Generates customized soil health, drainage, pH, and fertilizer recommendations.

**Request Body:**
```json
{
  "soilType": "clay",
  "soilPh": 5.2,
  "cropType": "Tomatoes"
}
```

---

## 7. User Data Privacy & GDPR

### `GET /api/user/export` *(Protected)*
Exports complete JSON payload of user profile, crops, tasks, and diagnosis history.

### `DELETE /api/user/account` *(Protected)*
Permanently erases user account and all farming records.
