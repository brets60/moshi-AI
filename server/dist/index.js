"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_js_1 = require("./config.js");
const ai_js_1 = require("./routes/ai.js");
const weather_js_1 = require("./routes/weather.js");
const crops_js_1 = require("./routes/crops.js");
const tasks_js_1 = require("./routes/tasks.js");
const soil_js_1 = require("./routes/soil.js");
const user_js_1 = require("./routes/user.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const publicDir = path_1.default.join(process.cwd(), 'public');
const mobileDistDir = path_1.default.join(process.cwd(), '../mobile/dist');
if (!fs_1.default.existsSync(publicDir)) {
    fs_1.default.mkdirSync(publicDir, { recursive: true });
}
// 1. Serve static APK downloads if any
app.use('/downloads', express_1.default.static(publicDir));
// 2. Serve static assets for the Expo Web App bundle
app.get('/sw.js', (req, res) => {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path_1.default.join(mobileDistDir, 'sw.js'));
});
app.use('/_expo', express_1.default.static(path_1.default.join(mobileDistDir, '_expo')));
app.use('/assets', express_1.default.static(path_1.default.join(mobileDistDir, 'assets')));
app.use(express_1.default.static(mobileDistDir));
// 3. Redirect /app to root / so Expo Router path matches root
app.get(['/app', '/app/*'], (req, res) => {
    res.redirect('/');
});
// 4. Friendly Mobile Download & Installer Guidance Page
app.get(['/download', '/installer'], (req, res) => {
    const apkPath = path_1.default.join(publicDir, 'AgriMateAI.apk');
    const apkExists = fs_1.default.existsSync(apkPath);
    const apkSizeMb = apkExists ? (fs_1.default.statSync(apkPath).size / (1024 * 1024)).toFixed(1) : null;
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriMate AI - Mobile Installer & Access</title>
  <link rel="icon" type="image/png" href="/icon.png">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: #F4F7F4; color: #1B2B1F; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .card { background: #FFFFFF; max-width: 440px; width: 100%; border-radius: 24px; padding: 32px 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center; border: 1px solid #E2ECE3; }
    .logo { width: 84px; height: 84px; background: #1E5E3A; border-radius: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 16px; box-shadow: 0 6px 16px rgba(30,94,58,0.25); }
    h1 { font-size: 24px; font-weight: 800; color: #1E5E3A; margin-bottom: 6px; }
    .tagline { font-size: 14px; color: #58705C; margin-bottom: 24px; }
    .badge-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .badge { background: #EAF5ED; color: #1E5E3A; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 12px; border: 1px solid #D2E7D6; }
    .btn { display: block; width: 100%; background: #1E5E3A; color: #FFFFFF; text-decoration: none; padding: 16px; font-size: 16px; font-weight: 700; border-radius: 14px; margin-bottom: 14px; box-shadow: 0 4px 14px rgba(30,94,58,0.3); transition: transform 0.1s; }
    .btn:active { transform: scale(0.98); }
    .btn-secondary { background: #EAF5ED; color: #1E5E3A; box-shadow: none; border: 1px solid #C5E0CB; }
    .info-box { background: #F8FAF8; border: 1px solid #E8EFE9; border-radius: 14px; padding: 16px; margin-top: 20px; text-align: left; font-size: 13px; color: #4B6150; line-height: 1.6; }
    .info-box h3 { font-size: 14px; font-weight: 700; color: #1E5E3A; margin-bottom: 8px; }
    .info-box ol { padding-left: 20px; }
    .info-box li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🌾</div>
    <h1>AgriMate AI</h1>
    <p class="tagline">Smart Farming Assistant para sa mga Magsasaka</p>
    
    <div class="badge-row">
      <span class="badge">🇵🇭 Tagalog</span>
      <span class="badge">🏝️ Bisaya</span>
      <span class="badge">🌐 English</span>
      <span class="badge">v1.0.0</span>
    </div>

    <a href="/" class="btn">
      📲 Buksan ang AgriMate AI App (Installable)
    </a>

    ${apkExists ? `
      <a href="/downloads/AgriMateAI.apk" download="AgriMateAI.apk" class="btn btn-secondary">
        📥 Download Android APK File ${apkSizeMb ? `(${apkSizeMb} MB)` : ''}
      </a>
    ` : ''}

    <div class="info-box">
      <h3>Paano I-install ang App sa Cellphone (1-Tap):</h3>
      <ol>
        <li>Pindutin ang <b>Buksan ang AgriMate AI App</b> sa itaas.</li>
        <li>Pindutin ang tatlong tuldok (<b>⋮</b>) sa kanang itaas ng Chrome <i>(o Share button sa Safari)</i>.</li>
        <li>Piliin ang <b>"Install app"</b> o <b>"Add to Home screen"</b> (Idagdag sa Home screen).</li>
        <li>Lilitaw agad ang icon ng <b>AgriMate AI</b> sa home screen ng telepono mo na parang tunay na na-download na app!</li>
      </ol>
    </div>
  </div>
</body>
</html>`);
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'AgriMate AI Backend Service',
        gemini_connected: Boolean(config_js_1.config.geminiApiKey),
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/ai', ai_js_1.aiRouter);
app.use('/api/weather', weather_js_1.weatherRouter);
app.use('/api/crops', crops_js_1.cropsRouter);
app.use('/api/tasks', tasks_js_1.tasksRouter);
app.use('/api/soil', soil_js_1.soilRouter);
app.use('/api/user', user_js_1.userRouter);
// SPA Client-Side Fallback: serve mobile index.html for all non-API web routes
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path_1.default.join(mobileDistDir, 'index.html'));
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred.',
    });
});
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(config_js_1.config.port, () => {
        console.log(`🌾 AgriMate AI Server running on port ${config_js_1.config.port} (${config_js_1.config.nodeEnv})`);
    });
}
exports.default = app;
