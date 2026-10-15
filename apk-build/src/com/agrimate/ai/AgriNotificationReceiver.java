package com.agrimate.ai;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class AgriNotificationReceiver extends BroadcastReceiver {
    public static final String EXTRA_TITLE = "extra_title";
    public static final String EXTRA_MESSAGE = "extra_message";
    public static final String EXTRA_TYPE = "extra_type";

    @Override
    public void onReceive(Context context, Intent intent) {
        String title = intent.getStringExtra(EXTRA_TITLE);
        String message = intent.getStringExtra(EXTRA_MESSAGE);
        String type = intent.getStringExtra(EXTRA_TYPE);

        if (title == null || title.isEmpty()) {
            title = "🌱 Paalala mula sa AgriMate";
        }
        if (message == null || message.isEmpty()) {
            message = "May nakatakdang gawain sa iyong mga pananim ngayon.";
        }
        if (type == null || type.isEmpty()) {
            type = "general";
        }

        String channelId = MainActivity.CHANNEL_GENERAL;
        if ("weather".equalsIgnoreCase(type)) {
            channelId = MainActivity.CHANNEL_WEATHER;
        } else if ("crop".equalsIgnoreCase(type) || "reminder".equalsIgnoreCase(type)) {
            channelId = MainActivity.CHANNEL_CROPS;
        } else if ("pest".equalsIgnoreCase(type)) {
            channelId = MainActivity.CHANNEL_PESTS;
        }

        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= 23) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                (int) System.currentTimeMillis(),
                launchIntent,
                flags
            );

            Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                builder = new Notification.Builder(context, channelId);
            } else {
                builder = new Notification.Builder(context);
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
}
