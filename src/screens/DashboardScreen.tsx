import React, { useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfitLineChart } from '../components/ProfitLineChart';
import { TimeRangeChips } from '../components/TimeRangeChips';
import { useCoupons } from '../context/CouponsContext';
import { useUserProfile } from '../context/UserProfileContext';
import type { TimeRange } from '../utils/dateRange';
import {
  couponsInRange,
  cumulativeProfitSeries,
  roiPercent,
  sumStakes,
  sumWinnings,
  totalBalance,
} from '../utils/stats';

/** Szerokość pod wykres: padding ekranu (16×2) + Card.Content (16×2). */
const CHART_LAYOUT_WIDTH_OFFSET = 64;

/** Ekran 1: podsumowanie finansowe + wykres + filtry czasu. */
export function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { coupons, loading } = useCoupons();
  const { displayName } = useUserProfile();
  const [range, setRange] = useState<TimeRange>('month');
  const [refreshing, setRefreshing] = useState(false);

  const chartLayoutWidth = Dimensions.get('window').width - CHART_LAYOUT_WIDTH_OFFSET;

  const filtered = couponsInRange(coupons, range);
  const couponCountInPeriod = filtered.length;
  const balance = totalBalance(filtered);
  const roi = roiPercent(filtered);
  const stakes = sumStakes(filtered);
  const wins = sumWinnings(filtered);
  const series = cumulativeProfitSeries(coupons, range);

  const greeting = displayName.trim() ? displayName.trim() : 'Gość';

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      nestedScrollEnabled
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 24 + insets.bottom },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 400);
          }}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Witaj, {greeting}!
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Bilans w wybranym okresie
      </Text>

      <TimeRangeChips value={range} onChange={setRange} />

      <Card
        mode="outlined"
        style={[
          styles.hero,
          {
            marginTop: 16,
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <Card.Content>
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <Text
                variant="labelLarge"
                style={[
                  styles.heroLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Bilans całkowity
              </Text>
              <Text
                variant="displaySmall"
                style={[
                  styles.balanceValue,
                  {
                    color:
                      balance >= 0 ? theme.colors.primary : theme.colors.error,
                  },
                ]}
              >
                {balance >= 0 ? '+' : ''}
                {balance.toFixed(2)} PLN
              </Text>
            </View>

            <View
              style={[
                styles.heroDivider,
                { backgroundColor: theme.colors.outlineVariant ?? theme.colors.outline },
              ]}
            />

            <View style={styles.heroRight}>
              <Text
                variant="labelLarge"
                style={[styles.heroLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Liczba kuponów
              </Text>
              <Text
                variant="displaySmall"
                style={[styles.balanceValue, { color: theme.colors.onSurface }]}
              >
                {couponCountInPeriod}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.statsRow}>
        <StatPill label="ROI" value={`${roi.toFixed(1)} %`} theme={theme} />
        <StatPill
          label="Suma stawek"
          value={`${stakes.toFixed(2)} PLN`}
          theme={theme}
        />
        <StatPill
          label="Suma wygranych"
          value={`${wins.toFixed(2)} PLN`}
          theme={theme}
        />
      </View>

      <Card
        mode="outlined"
        style={[
          styles.chartCard,
          { marginTop: 12, borderColor: theme.colors.outline },
        ]}
      >
        <Card.Content>
          <Text
            variant="titleMedium"
            style={[styles.chartCardTitle, { color: theme.colors.onSurface }]}
          >
            Zysk / strata w czasie
          </Text>
          <ProfitLineChart
            points={series}
            timeRange={range}
            screenWidth={chartLayoutWidth}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function StatPill({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <Text
        variant="labelSmall"
        style={[styles.statPillLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <Text
        variant="titleSmall"
        style={[styles.statPillValue, { color: theme.colors.primary }]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {},
  subtitle: {
    marginBottom: 16,
  },
  hero: {
    borderRadius: 16,
    borderWidth: 1,
  },
  heroLabel: {},
  balanceValue: {
    marginTop: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroLeft: {
    flex: 3,
    minWidth: 0,
  },
  heroRight: {
    flex: 2,
    minWidth: 0,
    alignItems: 'flex-end',
  },
  heroDivider: {
    width: 1,
    alignSelf: 'stretch',
    opacity: 0.8,
  },
  chartCard: {
    width: '100%',
    borderRadius: 12,
    elevation: 0,
  },
  chartCardTitle: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 12,
  },
  statPillLabel: {},
  statPillValue: {},
});
