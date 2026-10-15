package com.agrimate.ai;

import android.webkit.JavascriptInterface;

public class AgriNotificationBridge {
    private final MainActivity activity;

    public AgriNotificationBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public boolean isNativeApp() {
        return true;
    }

    @JavascriptInterface
    public void requestNotificationPermission() {
        activity.requestNotificationPermissionFromJs();
    }

    @JavascriptInterface
    public void showNotification(String title, String message, String type) {
        activity.triggerNativeNotification(title, message, type);
    }

    @JavascriptInterface
    public void scheduleBackgroundNotification(String title, String message, String type, long delaySeconds) {
        activity.scheduleBackgroundAlarm(title, message, type, delaySeconds);
    }

    @JavascriptInterface
    public void reloadApp() {
        activity.triggerAppRefresh();
    }
}
