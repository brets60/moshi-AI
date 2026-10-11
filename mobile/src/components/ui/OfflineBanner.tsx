import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { Colors, Spacing } from '../../theme/colors';

interface OfflineBannerProps {
  isOffline: boolean;
  onRetrySync?: () => void;
  syncing?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  onRetrySync,
  syncing = false,
}) => {
  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <WifiOff size={16} color="#795548" style={styles.icon} />
        <Text style={styles.text}>
          Working Offline — Data is stored safely on your phone and will sync when connected.
        </Text>
      </View>
      {onRetrySync && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetrySync}
          disabled={syncing}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <RefreshCw size={14} color="#5D4037" />
          <Text style={styles.retryText}>{syncing ? 'Syncing...' : 'Retry'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EFEBE9',
    borderBottomWidth: 1,
    borderColor: '#D7CCC8',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    color: '#4E342E',
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D7CCC8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3E2723',
    marginLeft: 4,
  },
});
