/** Kolory Chip (Paper) dla filtrów zaznaczony / nie — ten sam układ w całej aplikacji. */
export function filterChipTheme(theme: any, selected: boolean) {
  return {
    backgroundColor: selected
      ? theme.colors.primaryContainer
      : theme.colors.surfaceVariant,
    color: selected ? theme.colors.primary : theme.colors.onSurfaceVariant,
  };
}
