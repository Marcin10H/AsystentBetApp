import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { filterChipTheme } from '../utils/filterChipTheme';

export type StatusFilter = 'all' | 'WYGRANY' | 'PRZEGRANY';

type Props = {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
};

function statusFilterLabel(f: StatusFilter): string {
  if (f === 'WYGRANY') return 'Wygrane';
  if (f === 'PRZEGRANY') return 'Przegrane';
  return 'Wszystkie';
}

/** Filtr listy kuponów po statusie („W grze” tylko w „Wszystkie”). */
export function StatusFilterChips({ value, onChange }: Props) {
  const theme = useTheme();
  const keys: StatusFilter[] = ['all', 'WYGRANY', 'PRZEGRANY'];

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
            {statusFilterLabel(k)}
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
