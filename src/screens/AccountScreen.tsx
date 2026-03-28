import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  InteractionManager,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
  Avatar,
  Button,
  Card,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { useCoupons } from '../context/CouponsContext';
import { useUserProfile } from '../context/UserProfileContext';
import type { TimeRange } from '../utils/dateRange';
import {
  couponsInRange,
  formatStakesWithFreebetHint,
  roiPercent,
  sumWinnings,
  totalBalance,
} from '../utils/stats';

export function AccountScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { displayName, setDisplayName } = useUserProfile();
  const { coupons, clearAllCoupons } = useCoupons();
  const [nameDraft, setNameDraft] = useState(displayName);
  const viewShotRef = useRef<ViewShot | null>(null);

  const [reportRange, setReportRange] = useState<TimeRange>('month');

  React.useEffect(() => {
    setNameDraft(displayName);
  }, [displayName]);

  const saveName = () => {
    void setDisplayName(nameDraft);
  };

  const handleReset = () => {
    Alert.alert(
      'Wyczyścić wszystkie dane?',
      'Usunięte zostaną kupony oraz imię zapisane lokalnie.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Wyczyść',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await AsyncStorage.multiRemove([
                STORAGE_KEYS.coupons,
                STORAGE_KEYS.theme,
                STORAGE_KEYS.displayName,
              ]);
              await clearAllCoupons();
              await setDisplayName('');
            })();
          },
        },
      ]
    );
  };

  const buildReport = (range: TimeRange) => {
    const filtered = couponsInRange(coupons, range);
    const balance = totalBalance(filtered);
    const stakesDisplay = formatStakesWithFreebetHint(filtered);
    const wins = sumWinnings(filtered);
    const roi = roiPercent(filtered);
    return {
      couponCount: filtered.length,
      balance,
      stakesDisplay,
      wins,
      roi,
    };
  };

  const generateReport = async (range: TimeRange) => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Brak udostępniania', 'Ta funkcja nie jest dostępna na tym urządzeniu.');
        return;
      }

      setReportRange(range);
      // Krótka pauza — layout zdąży pokazać wybrany okres przed capture().
      await new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(resolve, 200);
            });
          });
        });
      });

      const uri = await viewShotRef.current?.capture?.();
      if (!uri) {
        Alert.alert(
          'Błąd',
          'Nie udało się wygenerować grafiki raportu. Spróbuj ponownie.',
        );
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Udostępnij raport',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Błąd raportu', message);
    }
  };

  const report = buildReport(reportRange);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Warstwa zrzutu poza ScrollView — inaczej capture() na Androidzie bywa puste. */}
      <View style={styles.captureWrap} pointerEvents="none" collapsable={false}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1 }}
          style={styles.captureShot}
        >
          <View
            style={[
              styles.captureCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <View
                style={[
                  styles.captureBgCircle,
                  styles.captureBgCircleTop,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              />
              <View
                style={[
                  styles.captureBgCircle,
                  styles.captureBgCircleBottom,
                  { backgroundColor: theme.colors.tertiaryContainer ?? theme.colors.primaryContainer },
                ]}
              />
              <View
                style={[
                  styles.captureBgStripe,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            </View>

            <Image
              source={require('../../assets/splash-logo.png')}
              style={styles.captureBrandLogo}
              resizeMode="contain"
            />

            <View style={styles.captureInner}>
              <View style={styles.captureHeader}>
                <Text
                  variant="headlineLarge"
                  style={[styles.captureTitle, { color: theme.colors.onSurface }]}
                >
                  Moje statystyki
                </Text>
                <View
                  style={[
                    styles.captureBadge,
                    {
                      backgroundColor: theme.colors.primaryContainer,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text style={[styles.captureBadgeText, { color: theme.colors.primary }]}>
                    {reportRange === 'week'
                      ? 'Ten tydzień'
                      : reportRange === 'month'
                        ? 'Ten miesiąc'
                        : 'Ten rok'}
                  </Text>
                </View>
              </View>

              <View style={styles.captureTopRow}>
              <View
                style={[
                  styles.captureCircleCard,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={[styles.captureLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Bilans
                </Text>
                <Text
                  style={[
                    styles.captureCircleValue,
                    {
                      color:
                        report.balance >= 0 ? theme.colors.primary : theme.colors.error,
                    },
                  ]}
                >
                  {report.balance >= 0 ? '+' : ''}
                  {report.balance.toFixed(2)}
                </Text>
                <Text style={[styles.captureUnit, { color: theme.colors.onSurfaceVariant }]}>
                  PLN
                </Text>
              </View>

              <View
                style={[
                  styles.captureCircleCard,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={[styles.captureLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Kupony
                </Text>
                <Text style={[styles.captureCircleValue, { color: theme.colors.onSurface }]}>
                  {report.couponCount}
                </Text>
                <Text style={[styles.captureUnit, { color: theme.colors.onSurfaceVariant }]}>
                  szt.
                </Text>
              </View>
            </View>

            <View style={styles.captureGrid}>
              <View
                style={[
                  styles.captureTile,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={[styles.captureLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Suma stawek (w tym freebet)
                </Text>
                <Text
                  style={[styles.captureTileValue, { color: theme.colors.onSurface }]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {report.stakesDisplay}
                </Text>
              </View>

              <View
                style={[
                  styles.captureTile,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={[styles.captureLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Suma wygranych
                </Text>
                <Text style={[styles.captureTileValue, { color: theme.colors.onSurface }]}>
                  {report.wins.toFixed(2)} PLN
                </Text>
              </View>

              <View
                style={[
                  styles.captureTile,
                  styles.captureTileWide,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={[styles.captureLabel, { color: theme.colors.onSurfaceVariant }]}>
                  ROI
                </Text>
                <Text style={[styles.captureRoiValue, { color: theme.colors.primary }]}>
                  {report.roi.toFixed(1)}%
                </Text>
              </View>
            </View>
            </View>
          </View>
        </ViewShot>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        removeClippedSubviews={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32 + insets.bottom,
        }}
      >
      <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
        Ustawienia i konto
      </Text>

      <View style={styles.profile}>
        <Avatar.Icon
          size={72}
          icon="account"
          style={{ backgroundColor: theme.colors.primaryContainer }}
        />
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 12 }}>
          {displayName.trim() || 'Twój profil'}
        </Text>
      </View>

      <Card mode="outlined" style={[styles.card, { borderColor: theme.colors.outline }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Imię (powitanie na podsumowaniu)
          </Text>
          <TextInput
            mode="outlined"
            placeholder="np. Marek"
            value={nameDraft}
            onChangeText={setNameDraft}
            style={{ marginTop: 12 }}
          />
          <Button mode="contained" onPress={saveName} style={{ marginTop: 12 }}>
            Zapisz imię
          </Button>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={[styles.card, { borderColor: theme.colors.outline }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Eksportuj statystyki
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Generuje grafikę (1080×1080) do udostępnienia lub zapisania.
          </Text>

          <View style={styles.exportButtons}>
            <Button mode="contained" onPress={() => void generateReport('week')}>
              Raport tygodniowy
            </Button>
            <Button mode="contained" onPress={() => void generateReport('month')}>
              Raport miesięczny
            </Button>
            <Button mode="contained" onPress={() => void generateReport('year')}>
              Raport roczny
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card
        mode="outlined"
        style={[
          styles.card,
          styles.dangerCard,
          { borderColor: theme.colors.error, backgroundColor: theme.colors.surface },
        ]}
      >
        <Card.Content>
          <Text variant="titleMedium" style={{ color: theme.colors.error }}>
            Wyczyść wszystkie dane
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Resetuje lokalną bazę kuponów i ustawienia profilu.
          </Text>
          <Button
            mode="outlined"
            textColor={theme.colors.error}
            style={{ marginTop: 12, borderColor: theme.colors.error }}
            onPress={handleReset}
          >
            Wyczyść dane (reset)
          </Button>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={[styles.card, { borderColor: theme.colors.outline }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            O projekcie
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            Aplikacja do śledzenia kuponów i prostych statystyk
          </Text>
        </Card.Content>
      </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  dangerCard: {
    borderWidth: 1,
  },
  exportButtons: {
    marginTop: 12,
    gap: 10,
  },
  captureWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
    width: 1080,
    height: 1080,
    overflow: 'hidden',
  },
  captureShot: {
    width: 1080,
    height: 1080,
  },
  captureCard: {
    width: 1080,
    height: 1080,
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  captureInner: {
    width: 1080,
    height: 1080,
    paddingHorizontal: 64,
    paddingVertical: 54,
    overflow: 'visible',
  },
  captureBrandLogo: {
    position: 'absolute',
    left: 30,
    top: -30,
    width: 272,
    height: 272,
    zIndex: 2,
  },
  captureHeader: {
    alignItems: 'center',
    gap: 12,
  },
  captureTitle: {
    textAlign: 'center',
    letterSpacing: 0.2,
    fontSize: 38,
  },
  captureBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  captureBadgeText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  captureTopRow: {
    marginTop: 46,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 22,
  },
  captureCircleCard: {
    width: 420,
    height: 420,
    borderRadius: 420,
    borderWidth: 4,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureGrid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  captureTile: {
    width: 448,
    minHeight: 176,
    borderRadius: 22,
    borderWidth: 3,
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  captureTileWide: {
    width: '100%',
    minHeight: 188,
  },
  captureLabel: {
    fontSize: 20,
    letterSpacing: 0.2,
    fontWeight: '600',
  },
  captureCircleValue: {
    fontSize: 70,
    fontWeight: '800',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  captureUnit: {
    marginTop: 6,
    fontSize: 20,
    letterSpacing: 0.2,
    fontWeight: '600',
  },
  captureTileValue: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  captureRoiValue: {
    fontSize: 62,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  captureBgCircle: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 520,
    opacity: 0.18,
  },
  captureBgCircleTop: {
    top: -140,
    right: -140,
  },
  captureBgCircleBottom: {
    bottom: -170,
    left: -170,
  },
  captureBgStripe: {
    position: 'absolute',
    left: -120,
    top: 250,
    width: 1300,
    height: 180,
    opacity: 0.14,
    transform: [{ rotate: '-12deg' }],
    borderRadius: 40,
  },
});
