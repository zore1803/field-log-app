import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useLogs } from '../context/LogsContext';
import { useNetwork } from '../context/NetworkContext';
import { colors, radius, spacing } from '../theme';

interface Props {
  onClose: () => void;
  onSubmitted: (variant: 'success' | 'offline') => void;
}

export function NewLogScreen({ onClose, onSubmitted }: Props) {
  const { addLog } = useLogs();
  const { isOnline } = useNetwork();
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [timestamp] = useState(Date.now());

  const canSubmit = customerName.trim().length > 0 && notes.trim().length > 0;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    addLog({ customerName: customerName.trim(), notes: notes.trim(), timestamp, imageUri });
    onClose();
    onSubmitted(isOnline ? 'success' : 'offline');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Field Log</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Customer Name</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="e.g. Rohan Mehta"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Log Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe the visit, findings, or issue…"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Timestamp</Text>
          <View style={[styles.input, styles.readonlyInput]}>
            <Text style={styles.readonlyText}>{new Date(timestamp).toLocaleString()}</Text>
          </View>

          <Text style={styles.label}>Photo (optional)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
                <Text style={styles.imagePlaceholderText}>Tap to attach a photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {!isOnline && (
            <View style={styles.offlineNotice}>
              <Ionicons name="cloud-offline-outline" size={16} color={colors.danger} />
              <Text style={styles.offlineNoticeText}>
                You're offline. This log will be saved locally and synced automatically.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.submitBtnText}>Submit Log</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  form: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  notesInput: {
    minHeight: 100,
  },
  readonlyInput: {
    backgroundColor: colors.chromeBg,
    justifyContent: 'center',
  },
  readonlyText: {
    fontSize: 15,
    color: colors.text,
  },
  imagePicker: {
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: colors.chromeBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imagePlaceholderText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: radius.sm,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerBg,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.lg,
  },
  offlineNoticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.danger,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
