package com.agrimate.ai;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity implements Runnable {
    public static final int FILE_CHOOSER_RESULT_CODE = 1001;
    public static final int PERMISSION_REQUEST_CODE = 1002;
    public static final String APP_URL = "https://agrimate-ai.vercel.app";

    public static final String CHANNEL_WEATHER = "agri_weather_alerts";
    public static final String CHANNEL_CROPS = "agri_crop_reminders";
    public static final String CHANNEL_PESTS = "agri_pest_warnings";
    public static final String CHANNEL_GENERAL = "agri_general";

    private WebView webView;
    private ValueCallback<Uri[]> uploadMessage;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        if (Build.VERSION.SDK_INT >= 21) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(0xFF1E5E3A); // AgriMate Forest Green
        }

        createNotificationChannels();

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        if (Build.VERSION.SDK_INT >= 21) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.addJavascriptInterface(new AgriNotificationBridge(this), "AgriAndroid");

        webView.setWebViewClient(new AgriWebViewClient(this));
        webView.setWebChromeClient(new AgriWebChromeClient(this));

        webView.loadUrl(APP_URL);

        checkPermissions();
    }

    @Override
    public void run() {
        checkPermissions();
    }

    public void requestNotificationPermissionFromJs() {
        runOnUiThread(this);
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            NotificationChannel weatherChannel = new NotificationChannel(
                CHANNEL_WEATHER,
                "Typhoon & Weather Alerts",
                NotificationManager.IMPORTANCE_HIGH
            );
            weatherChannel.setDescription("Urgent alerts for typhoons, heavy rain, and extreme weather");
            weatherChannel.enableLights(true);
            weatherChannel.setLightColor(Color.RED);
            weatherChannel.enableVibration(true);
            nm.createNotificationChannel(weatherChannel);

            NotificationChannel cropChannel = new NotificationChannel(
                CHANNEL_CROPS,
                "Crop Care & Fertilizer Reminders",
                NotificationManager.IMPORTANCE_HIGH
            );
            cropChannel.setDescription("Schedules for basal, top-dress fertilizer, watering, and harvest");
            cropChannel.enableLights(true);
            cropChannel.setLightColor(Color.GREEN);
            cropChannel.enableVibration(true);
            nm.createNotificationChannel(cropChannel);

            NotificationChannel pestChannel = new NotificationChannel(
                CHANNEL_PESTS,
                "Pest & Disease Outbreaks",
                NotificationManager.IMPORTANCE_HIGH
            );
            pestChannel.setDescription("Regional warnings for fall armyworm, stem borer, and blight");
            pestChannel.enableLights(true);
            pestChannel.setLightColor(Color.YELLOW);
            pestChannel.enableVibration(true);
            nm.createNotificationChannel(pestChannel);

            NotificationChannel generalChannel = new NotificationChannel(
                CHANNEL_GENERAL,
                "General Announcements",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            nm.createNotificationChannel(generalChannel);
        }
    }

    public void triggerNativeNotification(String title, String message, String type) {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            String channelId = CHANNEL_GENERAL;
            if ("weather".equalsIgnoreCase(type)) {
                channelId = CHANNEL_WEATHER;
            } else if ("crop".equalsIgnoreCase(type) || "reminder".equalsIgnoreCase(type)) {
                channelId = CHANNEL_CROPS;
            } else if ("pest".equalsIgnoreCase(type)) {
                channelId = CHANNEL_PESTS;
            }

            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            
            int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= 23) {
                pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 
                (int) System.currentTimeMillis(), 
                intent, 
                pendingFlags
            );

            Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                builder = new Notification.Builder(this, channelId);
            } else {
                builder = new Notification.Builder(this);
                builder.setPriority(Notification.PRIORITY_HIGH);
            }

            builder.setContentTitle(title)
                   .setContentText(message)
                   .setSmallIcon(R.drawable.ic_launcher)
                   .setContentIntent(pendingIntent)
                   .setAutoCancel(true)
                   .setStyle(new Notification.BigTextStyle().bigText(message));

            nm.notify((int) (System.currentTimeMillis() % 100000), builder.build());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public ValueCallback<Uri[]> getUploadMessage() {
        return uploadMessage;
    }

    public void setUploadMessage(ValueCallback<Uri[]> uploadMessage) {
        this.uploadMessage = uploadMessage;
    }

    public void checkPermissions() {
        if (Build.VERSION.SDK_INT >= 23) {
            List<String> neededPermissions = new ArrayList<String>();
            
            if (checkSelfPermission("android.permission.CAMERA") != PackageManager.PERMISSION_GRANTED) {
                neededPermissions.add("android.permission.CAMERA");
            }
            if (Build.VERSION.SDK_INT <= 32) {
                if (checkSelfPermission("android.permission.READ_EXTERNAL_STORAGE") != PackageManager.PERMISSION_GRANTED) {
                    neededPermissions.add("android.permission.READ_EXTERNAL_STORAGE");
                }
            }
            if (Build.VERSION.SDK_INT >= 33) {
                if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                    neededPermissions.add("android.permission.POST_NOTIFICATIONS");
                }
            }

            if (!neededPermissions.isEmpty()) {
                requestPermissions(neededPermissions.toArray(new String[neededPermissions.size()]), PERMISSION_REQUEST_CODE);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (uploadMessage == null) return;
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                String dataString = data.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
            uploadMessage.onReceiveValue(results);
            uploadMessage = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
