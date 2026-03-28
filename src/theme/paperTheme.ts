import { MD3DarkTheme } from 'react-native-paper';

export const darkPaperTheme: any = {
  ...(MD3DarkTheme as any),
  colors: {
    ...(MD3DarkTheme as any).colors,
    primary: '#4EE5E5',
    primaryContainer: '#1A3D3D',
    secondary: '#7DD3C0',
    background: '#0B0E11',
    surface: '#161A1F',
    surfaceVariant: '#252A32',
    onSurface: '#E8EAED',
    onSurfaceVariant: '#9AA0A6',
    outline: '#3D454E',
    error: '#FF4B4B',
    onPrimary: '#0B0E11',
    tertiary: '#4ADE80',
    onTertiary: '#0B0E11',
  },
};
