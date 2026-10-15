import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { OfflineProvider } from '../src/context/OfflineContext';
import { Colors } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OfflineProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTintColor: Colors.primary,
              headerTitleStyle: {
                fontWeight: '700',
                color: Colors.text,
              },
              contentStyle: {
                backgroundColor: Colors.background,
              },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="weather"
              options={{
                title: 'Weather & Farming Conditions',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="soil-guide"
              options={{
                title: 'Soil & Fertilizer Guide',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="saved-history"
              options={{
                title: 'Saved Diagnoses & Advice',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="notifications"
              options={{
                title: 'Task Reminders',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="profile"
              options={{
                title: 'Farmer Profile',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="calculator"
              options={{
                title: 'Kalkulador ng Abono at Spray',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="market-prices"
              options={{
                title: 'Bantay Presyo ng Ani (DA)',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="ledger"
              options={{
                title: 'Talaan ng Gastos at Kita',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="pest-guide"
              options={{
                title: 'Gabay sa Peste at Organiko',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="settings/index"
              options={{
                title: 'Settings',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="settings/permissions"
              options={{
                title: 'Permission Center',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="crop/[id]"
              options={{
                title: 'Crop Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="crop/add"
              options={{
                title: 'Add New Crop',
                presentation: 'modal',
                headerBackTitle: 'Cancel',
              }}
            />
            <Stack.Screen
              name="crop/edit"
              options={{
                title: 'Edit Crop',
                presentation: 'modal',
                headerBackTitle: 'Cancel',
              }}
            />
            <Stack.Screen
              name="analysis/[id]"
              options={{
                title: 'Plant Health Report',
                headerBackTitle: 'Back',
              }}
            />
          </Stack>
        </OfflineProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
