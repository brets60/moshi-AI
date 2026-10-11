import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import {
  CloudSun,
  Droplets,
  Wind,
  Compass,
  MapPin,
  Search,
  Clock,
  ShieldAlert,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import { api } from '../src/services/api';
import { permissionManager } from '../src/services/permissions';
import { PermissionModal } from '../src/components/PermissionModal';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';

export default function WeatherScreen() {
  const [weather, setWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState('Central Valley');
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);

  // Manual search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Permission modal
  const [permModalVisible, setPermModalVisible] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, [latitude, longitude]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const data = await api.getWeather(latitude, longitude, locationName);
      setWeather(data);
    } catch (err: any) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeather();
  };

  const handleUseCurrentLocation = async () => {
    const status = await permissionManager.getStatus('location');
    if (status === 'granted') {
      getCurrentCoordinates();
    } else {
      setPermModalVisible(true);
    }
  };

  const getCurrentCoordinates = async () => {
    try {
      setLoading(true);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      setLocationName('Current Farm GPS');
    } catch (err) {
      Alert.alert(
        'GPS Unavailable',
        'Could not obtain precise GPS coordinates. You can search your town name directly.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCity = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const results = await api.searchLocations(searchQuery.trim());
      setSearchResults(results);
    } catch (e) {
      console.warn('Search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: any) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setLocationName(`${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}`);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Location Switcher Bar */}
        <Card variant="flat" style={styles.locationSelectorCard}>
          <View style={styles.locationTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <MapPin size={20} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.currentLocationName}>{locationName}</Text>
            </View>
            <TouchableOpacity style={styles.gpsBtn} onPress={handleUseCurrentLocation}>
              <Text style={styles.gpsBtnText}>Use GPS</Text>
            </TouchableOpacity>
          </View>

          {/* Manual City Search Bar (Fallback if GPS is denied or user prefers) */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search farm city or region (e.g. Salinas)..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchCity}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchCity}>
              <Search size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsDropdown}>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultItem}
                  onPress={() => handleSelectLocation(item)}
                >
                  <Text style={styles.resultCity}>{item.name}</Text>
                  <Text style={styles.resultCountry}>
                    {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {weather ? (
          <>
            {/* Current Conditions Card */}
            <Card style={styles.mainWeatherCard}>
              <View style={styles.mainTopRow}>
                <View>
                  <Text style={styles.tempLarge}>
                    {Math.round(weather.current.temperature)}°C
                  </Text>
                  <Text style={styles.apparentTemp}>
                    Feels like {Math.round(weather.current.apparent_temperature)}°C
                  </Text>
                  <Text style={styles.conditionText}>
                    {weather.current.weather_description}
                  </Text>
                </View>

                <View style={styles.weatherIconCircle}>
                  <CloudSun size={54} color={Colors.primary} />
                </View>
              </View>

              <View style={styles.weatherDivider} />

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Droplets size={20} color="#1E88E5" style={{ marginBottom: 4 }} />
                  <Text style={styles.statLabel}>Precipitation</Text>
                  <Text style={styles.statValue}>
                    {weather.current.precipitation_probability ?? 0}%
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Wind size={20} color="#546E7A" style={{ marginBottom: 4 }} />
                  <Text style={styles.statLabel}>Wind Speed</Text>
                  <Text style={styles.statValue}>
                    {Math.round(weather.current.wind_speed)} km/h
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Compass size={20} color="#8E24AA" style={{ marginBottom: 4 }} />
                  <Text style={styles.statLabel}>Humidity</Text>
                  <Text style={styles.statValue}>{weather.current.relative_humidity}%</Text>
                </View>
              </View>

              <View style={styles.updatedRow}>
                <Clock size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                <Text style={styles.updatedText}>
                  Observation Updated: {new Date(weather.fetched_at).toLocaleTimeString()}
                </Text>
              </View>
            </Card>

            {/* Practical Agricultural Guidance */}
            <Text style={styles.sectionTitle}>Fieldwork & Irrigation Guidance</Text>
            <Card style={styles.advisoryCard}>
              <View style={styles.advisoryRow}>
                <View style={styles.advisoryHeader}>
                  <Text style={styles.advisorySub}>Water Management</Text>
                  <Badge label="Irrigation Advice" variant="primary" />
                </View>
                <Text style={styles.advisoryContent}>
                  {weather.farming_advisory.irrigation_advice}
                </Text>
              </View>

              <View style={[styles.advisoryRow, { marginTop: 12 }]}>
                <View style={styles.advisoryHeader}>
                  <Text style={styles.advisorySub}>Foliar Spraying Conditions</Text>
                  <Badge
                    label={weather.farming_advisory.spraying_suitability}
                    variant={
                      weather.farming_advisory.spraying_suitability === 'Favorable'
                        ? 'success'
                        : weather.farming_advisory.spraying_suitability === 'Caution'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </View>
                <Text style={styles.advisoryContent}>
                  {weather.farming_advisory.spraying_advice}
                </Text>
              </View>

              {weather.farming_advisory.temperature_alert && (
                <View style={styles.tempAlertBox}>
                  <ShieldAlert size={18} color="#C62828" style={{ marginRight: 6 }} />
                  <Text style={styles.tempAlertText}>
                    {weather.farming_advisory.temperature_alert}
                  </Text>
                </View>
              )}
            </Card>

            {/* Hourly Forecast */}
            {weather.hourly_forecast && weather.hourly_forecast.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Hourly Forecast (Next 12 Hours)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
                  {weather.hourly_forecast.map((h: any, idx: number) => (
                    <Card key={idx} style={styles.hourCard}>
                      <Text style={styles.hourTime}>
                        {h.time ? h.time.split('T')[1]?.slice(0, 5) : `${idx}h`}
                      </Text>
                      <CloudSun size={24} color={Colors.primary} style={{ marginVertical: 6 }} />
                      <Text style={styles.hourTemp}>{Math.round(h.temperature)}°C</Text>
                      <Text style={styles.hourRain}>{h.precipitation_probability}% rain</Text>
                    </Card>
                  ))}
                </ScrollView>
              </>
            )}

            {/* 5-Day Daily Outlook */}
            {weather.daily_forecast && weather.daily_forecast.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>5-Day Farming Outlook</Text>
                <Card style={styles.dailyCard}>
                  {weather.daily_forecast.map((day: any, idx: number) => (
                    <View key={idx} style={styles.dailyRow}>
                      <Text style={styles.dailyDate}>{day.date}</Text>
                      <View style={styles.dailyDescGroup}>
                        <Text style={styles.dailyDescText}>{day.weather_description}</Text>
                        <Text style={styles.dailyRainText}>
                          Rain: {day.precipitation_probability_max}%
                        </Text>
                      </View>
                      <View style={styles.dailyTemps}>
                        <Text style={styles.dailyHigh}>{Math.round(day.temp_max)}°</Text>
                        <Text style={styles.dailyLow}>{Math.round(day.temp_min)}°</Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            )}
          </>
        ) : null}
      </ScrollView>

      {/* Permission Modal */}
      <PermissionModal
        visible={permModalVisible}
        type="location"
        onGranted={() => {
          setPermModalVisible(false);
          getCurrentCoordinates();
        }}
        onDismiss={() => {
          setPermModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  locationSelectorCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  locationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentLocationName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  gpsBtn: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  gpsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  searchRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#DCE4DD',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.text,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  resultsDropdown: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EDF2EE',
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  resultCity: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  resultCountry: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  mainWeatherCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  mainTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempLarge: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.primary,
  },
  apparentTemp: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  weatherIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherDivider: {
    height: 1,
    backgroundColor: '#EDF2EE',
    marginVertical: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  updatedText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: 8,
  },
  advisoryCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  advisoryRow: {
    marginBottom: 4,
  },
  advisoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  advisorySub: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  advisoryContent: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tempAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: BorderRadius.md,
    marginTop: 10,
  },
  tempAlertText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
    flex: 1,
  },
  hourlyScroll: {
    marginBottom: Spacing.md,
  },
  hourCard: {
    width: 90,
    alignItems: 'center',
    marginRight: 8,
    padding: 10,
  },
  hourTime: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  hourTemp: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  hourRain: {
    fontSize: 11,
    color: '#1E88E5',
    fontWeight: '600',
    marginTop: 2,
  },
  dailyCard: {
    padding: Spacing.md,
  },
  dailyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  dailyDate: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    width: 85,
  },
  dailyDescGroup: {
    flex: 1,
    paddingHorizontal: 8,
  },
  dailyDescText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  dailyRainText: {
    fontSize: 11,
    color: '#1E88E5',
  },
  dailyTemps: {
    flexDirection: 'row',
  },
  dailyHigh: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 6,
  },
  dailyLow: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
