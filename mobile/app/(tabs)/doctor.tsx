import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Stethoscope,
  Send,
  History,
} from 'lucide-react-native';
import { api } from '../../src/services/api';
import { permissionManager, PermissionType } from '../../src/services/permissions';
import { PermissionModal } from '../../src/components/PermissionModal';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';

export default function DoctorScreen() {
  const router = useRouter();

  const [crops, setCrops] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [symptomsText, setSymptomsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  // Polite Pre-Permission Modal State
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [pendingPermissionType, setPendingPermissionType] = useState<PermissionType>('camera');

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const data = await api.getCrops('Active');
      setCrops(data);
      if (data.length > 0) setSelectedCrop(data[0].crop_name);
    } catch (e) {
      console.warn('Failed to load crops for doctor:', e);
    }
  };

  const handleInitiateCamera = async () => {
    const status = await permissionManager.getStatus('camera');
    if (status === 'granted') {
      launchCamera();
    } else {
      setPendingPermissionType('camera');
      setPermissionModalVisible(true);
    }
  };

  const handleInitiateGallery = async () => {
    const status = await permissionManager.getStatus('photos');
    if (status === 'granted') {
      launchGallery();
    } else {
      setPendingPermissionType('photos');
      setPermissionModalVisible(true);
    }
  };

  const launchCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        setSelectedImageBase64(result.assets[0].base64 || null);
        setDiagnosisResult(null);
      }
    } catch (err) {
      console.warn('Camera launch failed:', err);
      Alert.alert(
        'Camera Unavailable',
        'Could not open camera on this device. You can choose a photo from your gallery instead.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Gallery', onPress: launchGallery },
        ]
      );
    }
  };

  const launchGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        setSelectedImageBase64(result.assets[0].base64 || null);
        setDiagnosisResult(null);
      }
    } catch (err) {
      console.warn('Gallery pick failed:', err);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedImageUri) {
      Alert.alert('Photo Needed', 'Please capture or choose a plant leaf photo first.');
      return;
    }

    setLoading(true);
    try {
      // Use base64 or placeholder sample if simulator doesn't provide base64
      const b64 = selectedImageBase64 || 'data:image/jpeg;base64,samplephoto';
      const result = await api.diagnosePlant(b64, selectedCrop, symptomsText);
      setDiagnosisResult(result);
    } catch (err: any) {
      Alert.alert('Analysis Notice', err.message || 'Could not analyze plant image.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImageUri(null);
    setSelectedImageBase64(null);
    setSymptomsText('');
    setDiagnosisResult(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Intro Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Stethoscope size={30} color={Colors.primary} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>AI Crop Health Diagnostics</Text>
            <Text style={styles.bannerDesc}>
              Photograph leaves, stems, or pests. AgriMate analyzes visible symptoms and provides safe treatment guidance.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => router.push('/saved-history')}
            accessibilityLabel="Past Diagnoses"
          >
            <History size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Step 1: Crop Selection */}
        <Text style={styles.stepTitle}>1. Select Target Crop</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsRow}>
          <TouchableOpacity
            style={[styles.cropChip, !selectedCrop && styles.cropChipActive]}
            onPress={() => setSelectedCrop('')}
          >
            <Text style={[styles.cropChipText, !selectedCrop && styles.cropChipTextActive]}>
              Unsure / General
            </Text>
          </TouchableOpacity>
          {crops.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.cropChip, selectedCrop === c.crop_name && styles.cropChipActive]}
              onPress={() => setSelectedCrop(c.crop_name)}
            >
              <Text
                style={[
                  styles.cropChipText,
                  selectedCrop === c.crop_name && styles.cropChipTextActive,
                ]}
              >
                {c.crop_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Step 2: Image Selection or Preview */}
        <Text style={styles.stepTitle}>2. Photograph Plant Issue</Text>

        {!selectedImageUri ? (
          <Card variant="flat" style={styles.captureBox}>
            <View style={styles.captureActions}>
              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={handleInitiateCamera}
                activeOpacity={0.8}
              >
                <View style={[styles.circleIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Camera size={32} color={Colors.primary} />
                </View>
                <Text style={styles.actionBtnLabel}>Take Photo</Text>
                <Text style={styles.actionBtnSub}>Use Phone Camera</Text>
              </TouchableOpacity>

              <View style={styles.orDivider}>
                <Text style={styles.orText}>OR</Text>
              </View>

              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={handleInitiateGallery}
                activeOpacity={0.8}
              >
                <View style={[styles.circleIcon, { backgroundColor: '#E3F2FD' }]}>
                  <ImageIcon size={32} color="#1565C0" />
                </View>
                <Text style={styles.actionBtnLabel}>Choose Photo</Text>
                <Text style={styles.actionBtnSub}>From Photo Library</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>📸 Photography Tips for Accurate Diagnosis:</Text>
              <Text style={styles.tipItem}>• Focus closely on the affected leaf or stem.</Text>
              <Text style={styles.tipItem}>• Use natural morning light; avoid extreme flash glare.</Text>
              <Text style={styles.tipItem}>• Include both healthy and damaged tissue in the frame.</Text>
            </View>
          </Card>
        ) : (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImageUri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.previewOverlayBar}>
              <TouchableOpacity style={styles.retakeBtn} onPress={handleReset}>
                <RotateCcw size={16} color={Colors.white} />
                <Text style={styles.retakeText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Symptoms Description & Analysis Button */}
        {selectedImageUri && !diagnosisResult && (
          <View style={styles.diagnosisActionBox}>
            <Text style={styles.stepTitle}>3. Describe Visible Symptoms (Optional)</Text>
            <Input
              placeholder="e.g. Brown concentric rings started appearing on lower leaves after humid rain."
              value={symptomsText}
              onChangeText={setSymptomsText}
              multiline
              numberOfLines={3}
            />

            <Button
              title="Run AI Plant Health Diagnosis"
              variant="primary"
              size="lg"
              loading={loading}
              icon={<Sparkles size={20} color={Colors.white} />}
              onPress={handleDiagnose}
              style={{ marginTop: 8 }}
            />
          </View>
        )}

        {/* Diagnosis Results Display */}
        {diagnosisResult && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTitle}>Diagnostic Assessment</Text>
                <Text style={styles.resultCrop}>{diagnosisResult.crop_identification}</Text>
              </View>
              <Badge
                label={`Confidence: ${diagnosisResult.confidence_level || 'Moderate'}`}
                variant={diagnosisResult.confidence_level === 'High' ? 'success' : 'warning'}
              />
            </View>

            {/* Visible Symptoms */}
            <Card style={styles.resultCard}>
              <Text style={styles.cardHeaderTitle}>🔍 Observed Symptoms</Text>
              <Text style={styles.cardBodyText}>{diagnosisResult.symptoms}</Text>
            </Card>

            {/* Possible Causes */}
            <Card style={styles.resultCard}>
              <Text style={styles.cardHeaderTitle}>⚠️ Probable Causes</Text>
              <Text style={styles.disclaimerSubtext}>
                (Distinguishing likely causes from confirmed lab diagnoses)
              </Text>
              {diagnosisResult.possible_causes?.map((cause: string, i: number) => (
                <View key={i} style={styles.bulletRow}>
                  <AlertTriangle size={16} color="#E65100" style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={styles.causeText}>{cause}</Text>
                </View>
              ))}
            </Card>

            {/* Step-by-Step Recommendations */}
            <Card style={styles.resultCard}>
              <Text style={styles.cardHeaderTitle}>📋 Recommended Next Steps</Text>
              {diagnosisResult.recommendations?.map((rec: string, i: number) => (
                <View key={i} style={styles.bulletRow}>
                  <CheckCircle2 size={16} color={Colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </Card>

            {/* Prevention Methods */}
            {diagnosisResult.prevention_methods && (
              <Card style={styles.resultCard}>
                <Text style={styles.cardHeaderTitle}>🛡️ Cultural Prevention</Text>
                {diagnosisResult.prevention_methods.map((prev: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <ShieldCheck size={16} color="#2E7D32" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.prevText}>{prev}</Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Honest Uncertainty & Expert Referral Note */}
            <View style={styles.expertReferralBox}>
              <HelpCircle size={20} color="#0D47A1" style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.expertTitle}>When to Seek Expert Extension Help:</Text>
                <Text style={styles.expertText}>
                  {diagnosisResult.expert_referral_guidance ||
                    'If disease lesions affect more than 25% of your plot or spread to main stems, contact your local agricultural extension service with a sealed leaf sample.'}
                </Text>
                <Text style={styles.uncertaintyText}>
                  {diagnosisResult.uncertainty_notes ||
                    'Note: Mobile image analysis is indicative. Physical inspection confirms microscopic fungi and soil chemistry.'}
                </Text>
              </View>
            </View>

            <Button
              title="Test Another Plant Photo"
              variant="outline"
              size="lg"
              onPress={handleReset}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        )}
      </ScrollView>

      {/* Pre-Permission Modal */}
      <PermissionModal
        visible={permissionModalVisible}
        type={pendingPermissionType}
        onGranted={() => {
          setPermissionModalVisible(false);
          if (pendingPermissionType === 'camera') launchCamera();
          else if (pendingPermissionType === 'photos') launchGallery();
        }}
        onDismiss={() => {
          setPermissionModalVisible(false);
          // If camera was denied, gently offer gallery alternative
          if (pendingPermissionType === 'camera') {
            launchGallery();
          }
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  bannerIcon: {
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  bannerDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  historyBtn: {
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginLeft: 6,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cropsRow: {
    marginBottom: Spacing.md,
  },
  cropChip: {
    backgroundColor: '#F3F6F4',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E8E2',
  },
  cropChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cropChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cropChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  captureBox: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  captureActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: Spacing.md,
  },
  actionCircleBtn: {
    alignItems: 'center',
  },
  circleIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  actionBtnSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orDivider: {
    paddingHorizontal: 10,
  },
  orText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tipBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2EE',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginTop: Spacing.md,
    width: '100%',
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  tipItem: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  previewContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    position: 'relative',
    height: 240,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlayBar: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
  },
  retakeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  diagnosisActionBox: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  resultContainer: {
    marginTop: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  resultCrop: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  resultCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  disclaimerSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  cardBodyText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  causeText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
    fontWeight: '600',
  },
  recText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  prevText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  expertReferralBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
  },
  expertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D47A1',
    marginBottom: 2,
  },
  expertText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 16,
  },
  uncertaintyText: {
    fontSize: 11,
    color: '#42A5F5',
    lineHeight: 15,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
