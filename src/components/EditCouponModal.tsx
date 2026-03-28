import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Modal,
  Portal,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import type { Coupon, CouponStatus } from '../types/coupon';
import { parseNumberInput } from '../utils/parseNumber';

type Props = {
  visible: boolean;
  coupon: Coupon | null;
  onDismiss: () => void;
  onSave: (id: string, patch: Partial<Coupon>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

const STATUS_OPTIONS: { value: CouponStatus; label: string }[] = [
  { value: 'W_GRZE', label: 'W grze' },
  { value: 'WYGRANY', label: 'Wygrany' },
  { value: 'PRZEGRANY', label: 'Przegrany' },
];

export function EditCouponModal({
  visible,
  coupon,
  onDismiss,
  onSave,
  onDelete,
}: Props) {
  const theme = useTheme();
  const [nazwa, setNazwa] = useState('');
  const [kurs, setKurs] = useState('');
  const [stawka, setStawka] = useState('');
  const [wygrana, setWygrana] = useState('');
  const [status, setStatus] = useState<CouponStatus>('W_GRZE');
  const [freebet, setFreebet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (coupon && visible) {
      setNazwa(coupon.nazwaBukmachera);
      setKurs(String(coupon.kurs));
      setStawka(String(coupon.stawka));
      setWygrana(String(coupon.potencjalnaWygrana));
      setStatus(coupon.status);
      setFreebet(Boolean(coupon.freebet));
      setError(null);
    }
  }, [coupon, visible]);

  const handleClose = () => {
    setError(null);
    onDismiss();
  };

  const handleSave = async () => {
    if (!coupon) return;
    setError(null);
    if (!nazwa.trim()) {
      setError('Podaj nazwę bukmachera.');
      return;
    }
    const k = parseNumberInput(kurs);
    const s = parseNumberInput(stawka);
    const w = parseNumberInput(wygrana);
    if (!Number.isFinite(k) || k <= 0) {
      setError('Kurs musi być dodatnią liczbą.');
      return;
    }
    if (!Number.isFinite(s) || s <= 0) {
      setError('Stawka musi być dodatnią liczbą.');
      return;
    }
    if (!Number.isFinite(w) || w < 0) {
      setError('Kwota do wygrania musi być liczbą ≥ 0.');
      return;
    }
    setSaving(true);
    try {
      await onSave(coupon.id, {
        nazwaBukmachera: nazwa.trim(),
        kurs: k,
        stawka: s,
        potencjalnaWygrana: w,
        status,
        freebet,
      });
      onDismiss();
    } catch {
      setError('Nie udało się zapisać.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePress = () => {
    if (!coupon || !onDelete) return;
    Alert.alert(
      'Usunąć kupon?',
      'Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await onDelete(coupon.id);
                onDismiss();
              } catch {
                setError('Nie udało się usunąć.');
              }
            })();
          },
        },
      ]
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible && !!coupon}
        onDismiss={handleClose}
        contentContainerStyle={[
          styles.sheet,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text variant="titleLarge" style={styles.title}>
              Edycja kuponu
            </Text>
            <TextInput
              label="Nazwa bukmachera"
              value={nazwa}
              onChangeText={setNazwa}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Kurs"
              value={kurs}
              onChangeText={setKurs}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Stawka (PLN)"
              value={stawka}
              onChangeText={setStawka}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
            />
            <View style={styles.switchRow}>
              <Text variant="bodyLarge" style={styles.switchLabel}>
                Freebet
              </Text>
              <Switch value={freebet} onValueChange={setFreebet} />
            </View>
            <TextInput
              label="Kwota do wygrania (PLN)"
              value={wygrana}
              onChangeText={setWygrana}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
            />
            <Text variant="labelLarge" style={styles.label}>
              Status po rozliczeniu
            </Text>
            <SegmentedButtons
              value={status}
              onValueChange={(v) => setStatus(v as CouponStatus)}
              buttons={STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
            {error ? (
              <Text style={{ color: theme.colors.error, marginTop: 8 }}>
                {error}
              </Text>
            ) : null}
            <View style={styles.actions}>
              {onDelete && coupon ? (
                <Button
                  mode="outlined"
                  textColor={theme.colors.error}
                  onPress={handleDeletePress}
                  style={styles.btn}
                >
                  Usuń
                </Button>
              ) : null}
              <View style={styles.spacer} />
              <Button mode="outlined" onPress={handleClose} style={styles.btn}>
                Anuluj
              </Button>
              <Button
                mode="contained"
                onPress={() => void handleSave()}
                loading={saving}
                disabled={saving}
                style={styles.btn}
              >
                Zapisz
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '90%',
  },
  title: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 10,
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
    marginTop: 2,
  },
  switchLabel: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  spacer: {
    flexGrow: 1,
    minWidth: 8,
  },
  btn: {
    minWidth: 100,
  },
});
