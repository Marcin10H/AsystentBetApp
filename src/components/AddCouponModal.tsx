import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
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
import type { CouponStatus } from '../types/coupon';
import { parseNumberInput } from '../utils/parseNumber';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: {
    nazwaBukmachera: string;
    stawka: number;
    kurs: number;
    potencjalnaWygrana: number;
    status: CouponStatus;
    freebet: boolean;
  }) => Promise<void>;
};

const STATUS_OPTIONS: { value: CouponStatus; label: string }[] = [
  { value: 'W_GRZE', label: 'W grze' },
  { value: 'WYGRANY', label: 'Wygrany' },
  { value: 'PRZEGRANY', label: 'Przegrany' },
];

export function AddCouponModal({ visible, onDismiss, onSubmit }: Props) {
  const theme = useTheme();
  const [nazwa, setNazwa] = useState('');
  const [kurs, setKurs] = useState('');
  const [stawka, setStawka] = useState('');
  const [wygrana, setWygrana] = useState('');
  const [status, setStatus] = useState<CouponStatus>('W_GRZE');
  const [freebet, setFreebet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setNazwa('');
    setKurs('');
    setStawka('');
    setWygrana('');
    setStatus('W_GRZE');
    setFreebet(false);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onDismiss();
  };

  const handleAdd = async () => {
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
      await onSubmit({
        nazwaBukmachera: nazwa,
        kurs: k,
        stawka: s,
        potencjalnaWygrana: w,
        status,
        freebet,
      });
      reset();
      onDismiss();
    } catch {
      setError('Nie udało się zapisać. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
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
              Nowy kupon
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
              Status rozliczenia
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
              <Button mode="outlined" onPress={handleClose} style={styles.btn}>
                Anuluj
              </Button>
              <Button
                mode="contained"
                onPress={() => void handleAdd()}
                loading={saving}
                disabled={saving}
                style={styles.btn}
              >
                Dodaj kupon
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
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  btn: {
    minWidth: 120,
  },
});
