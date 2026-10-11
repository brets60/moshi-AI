import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { aiRouter } from './routes/ai.js';
import { weatherRouter } from './routes/weather.js';
import { cropsRouter } from './routes/crops.js';
import { tasksRouter } from './routes/tasks.js';
import { soilRouter } from './routes/soil.js';
import { userRouter } from './routes/user.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

import path from 'path';
import fs from 'fs';

const publicDir = path.join(process.cwd(), 'public');
const mobileDistDir = path.join(process.cwd(), '../mobile/dist');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Serve static APK downloads if any
app.use('/downloads', express.static(publicDir));

// 2. Serve static assets for the Expo Web App bundle
app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(mobileDistDir, 'sw.js'));
});

app.use('/_expo', express.static(path.join(mobileDistDir, '_expo')));
app.use('/assets', express.static(path.join(mobileDistDir, 'assets')));
app.use(express.static(mobileDistDir));

// 3. Redirect /app to root / so Expo Router path matches root
app.get(['/app', '/app/*'], (req, res) => {
  res.redirect('/');
});

// 4. Friendly Mobile Download & Installer Guidance Page
app.get(['/download', '/installer'], (req, res) => {
  const apkPath = path.join(publicDir, 'AgriMateAI.apk');
  const apkExists = fs.existsSync(apkPath);
  const apkSizeMb = apkExists ? (fs.statSync(apkPath).size / (1024 * 1024)).toFixed(1) : null;

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
    gemini_connected: Boolean(config.geminiApiKey),
    timestamp: new Date().toISOString(),
  });
});

app.use(['/api/ai', '/ai'], aiRouter);
app.use(['/api/weather', '/weather'], weatherRouter);
app.use(['/api/crops', '/crops'], cropsRouter);
app.use(['/api/tasks', '/tasks'], tasksRouter);
app.use(['/api/soil', '/soil'], soilRouter);
app.use(['/api/user', '/user'], userRouter);

// SPA Client-Side Fallback: serve mobile index.html for all non-API web routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(mobileDistDir, 'index.html'));
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`🌾 AgriMate AI Server running on port ${config.port} (${config.nodeEnv})`);
  });
}

export default app;
