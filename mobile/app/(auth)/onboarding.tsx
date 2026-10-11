import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Stethoscope, CloudRain, CalendarDays, ArrowRight } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Button } from '../../src/components/ui/Button';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'AI Plant Doctor',
    desc: 'Take a quick photo of sick leaves or insect damage. AgriMate identifies symptoms and gives practical, safe remedies.',
    icon: Stethoscope,
    color: '#2E7D32',
    bg: '#E8F5E9',
  },
  {
    id: 2,
    title: 'Real Weather & Farm Advice',
    desc: 'Accurate rain probability, wind speeds, and temperature alerts so you never waste water or spray on windy days.',
    icon: CloudRain,
    color: '#1565C0',
    bg: '#E3F2FD',
  },
  {
    id: 3,
    title: 'Easy Farming Planner',
    desc: 'Manage your plots, schedule watering and fertilizing routines, and get friendly reminders before harvest time.',
    icon: CalendarDays,
    color: '#E65100',
    bg: '#FFF3E0',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/(auth)/register');
    }
  };

  const currentSlide = SLIDES[currentIndex];
  const IconComponent = currentSlide.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>AgriMate AI</Text>
        <Button
          title="Skip"
          variant="ghost"
          size="sm"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: currentSlide.bg }]}>
          <IconComponent size={64} color={currentSlide.color} />
        </View>

        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.desc}>{currentSlide.desc}</Text>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          variant="primary"
          size="lg"
          icon={<ArrowRight size={20} color={Colors.white} />}
          onPress={handleNext}
          style={styles.nextButton}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <Button
            title="Log In"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#DCE4DD',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  nextButton: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
