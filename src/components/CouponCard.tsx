import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import type { Coupon, CouponStatus } from '../types/coupon';

function statusLabel(status: CouponStatus) {
  if (status === 'WYGRANY') return 'Wygrany';
  if (status === 'PRZEGRANY') return 'Przegrany';
  return 'W grze';
}

function statusColor(status: CouponStatus, theme: any): string {
  if (status === 'WYGRANY') return theme.colors.tertiary ?? '#4ADE80';
  if (status === 'PRZEGRANY') return theme.colors.error;
  return '#FBBF24';
}

type Props = {
  coupon: Coupon;
  onPress: () => void;
};

export function CouponCard({ coupon, onPress }: Props) {
  const theme: any = useTheme();
  const dot = statusColor(coupon.status, theme);

  return (
    <Pressable onPress={onPress} style={styles.press}>
      <Card
        mode="outlined"
        style={[styles.card, { borderColor: theme.colors.outline }]}
      >
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                {coupon.nazwaBukmachera || '—'}
              </Text>
              {coupon.freebet ? (
                <Chip
                  compact
                  mode="flat"
                  style={styles.freebetChip}
                  textStyle={styles.freebetChipText}
                >
                  Freebet
                </Chip>
              ) : null}
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: dot }]} />
              <Text
                variant="labelSmall"
                style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}
              >
                {statusLabel(coupon.status)}
              </Text>
            </View>
          </View>
          <View style={styles.grid}>
            <Cell label="Kurs" value={coupon.kurs.toFixed(2)} theme={theme} />
            <Cell label="Stawka" value={`${coupon.stawka.toFixed(2)} PLN`} theme={theme} />
            <Cell
              label="Do wygrania"
              value={`${coupon.potencjalnaWygrana.toFixed(2)} PLN`}
              theme={theme}
            />
            <Cell
              label="Data"
              value={new Date(coupon.dataDodania).toLocaleDateString('pl-PL')}
              theme={theme}
            />
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

function Cell({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={styles.cell}>
      <Text
        variant="labelSmall"
        style={[styles.cellLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <Text variant="bodyMedium" style={[styles.cellValue, { color: theme.colors.primary }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  press: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  freebetChip: {
    alignSelf: 'flex-start',
    marginTop: 2,
    height: 28,
  },
  freebetChipText: {
    fontSize: 11,
    marginVertical: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: '45%',
    minWidth: 120,
  },
  cardTitle: {},
  statusText: {},
  cellLabel: {},
  cellValue: {},
});
