import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import type { TimeRange } from '../utils/dateRange';
import { filterChipTheme } from '../utils/filterChipTheme';

type Props = {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
};

function rangeLabel(r: TimeRange): string {
  if (r === 'week') return 'Ten tydzień';
  if (r === 'month') return 'Ten miesiąc';
  return 'Ten rok';
}

/** Zakres czasu na wykresach / statystykach: tydzień, miesiąc, rok. */
export function TimeRangeChips({ value, onChange }: Props) {
  const theme = useTheme();
  const keys: TimeRange[] = ['week', 'month', 'year'];

  return (
    <View style={styles.row}>
      {keys.map((k) => {
        const selected = value === k;
        const c = filterChipTheme(theme, selected);
        return (
          <Chip
            key={k}
            mode="flat"
            selected={selected}
            onPress={() => onChange(k)}
            style={[styles.chip, { backgroundColor: c.backgroundColor }]}
            textStyle={{ color: c.color, fontSize: 12 }}
          >
            {rangeLabel(k)}
          </Chip>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    marginRight: 0,
    flexGrow: 1,
    flexBasis: 0,
  },
});
