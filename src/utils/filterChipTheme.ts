export function filterChipTheme(theme: any, selected: boolean) {
  return {
    backgroundColor: selected
      ? theme.colors.primaryContainer
      : theme.colors.surfaceVariant,
    color: selected ? theme.colors.primary : theme.colors.onSurfaceVariant,
  };
}
