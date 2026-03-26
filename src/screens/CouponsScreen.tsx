import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddCouponModal } from '../components/AddCouponModal';
import { CouponCard } from '../components/CouponCard';
import { EditCouponModal } from '../components/EditCouponModal';
import {
  StatusFilterChips,
  type StatusFilter,
} from '../components/StatusFilterChips';
import { TimeRangeChips } from '../components/TimeRangeChips';
import { useCoupons } from '../context/CouponsContext';
import type { Coupon } from '../types/coupon';
import {
  filterCouponsByTimeRange,
  type TimeRange,
} from '../utils/dateRange';

/** Ekran 2: lista kuponów, filtry, FAB i modale dodawania / edycji. */
export function CouponsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);

  const byTime = filterCouponsByTimeRange(coupons, timeRange);
  const filtered =
    statusFilter === 'all'
      ? byTime
      : byTime.filter((c) => c.status === statusFilter);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filters}>
        <Text
          variant="labelLarge"
          style={[styles.sectionLabel, { color: theme.colors.onSurface }]}
        >
          Status
        </Text>
        <StatusFilterChips value={statusFilter} onChange={setStatusFilter} />
        <Text
          variant="labelLarge"
          style={[
            styles.sectionLabel,
            styles.sectionLabelAfter,
            { color: theme.colors.onSurface },
          ]}
        >
          Okres
        </Text>
        <TimeRangeChips value={timeRange} onChange={setTimeRange} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        ListEmptyComponent={
          <Text
            style={[
              styles.emptyText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Brak kuponów w tym widoku. Dodaj pierwszy kupon przyciskiem +.
          </Text>
        }
        renderItem={({ item }) => (
          <CouponCard coupon={item} onPress={() => setEditCoupon(item)} />
        )}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => setAddOpen(true)}
        color={theme.colors.onPrimary}
      />

      <AddCouponModal
        visible={addOpen}
        onDismiss={() => setAddOpen(false)}
        onSubmit={async (data) => {
          await addCoupon(data);
        }}
      />

      <EditCouponModal
        visible={!!editCoupon}
        coupon={editCoupon}
        onDismiss={() => setEditCoupon(null)}
        onSave={async (id, patch) => {
          await updateCoupon(id, patch);
        }}
        onDelete={deleteCoupon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  filters: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionLabel: {
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
  },
  sectionLabelAfter: {
    marginTop: 12,
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
  },
});
