import 'package:flutter/material.dart';

/// Gold accent. Light and dark follow the system theme.
const Color kMatteBlack = Color(0xFF0B0B0B);
const Color kSurface = Color(0xFF141414);
const Color kGold = Color(0xFFC9A227);
const Color kGoldDim = Color(0xFF8A7219);
const Color kIvory = Color(0xFFE8E0D0);

ThemeData buildAppTheme([Brightness brightness = Brightness.dark]) {
  final dark = brightness == Brightness.dark;
  final scheme = ColorScheme(
    brightness: brightness,
    primary: kGold,
    onPrimary: kMatteBlack,
    secondary: kGoldDim,
    onSecondary: dark ? kIvory : kMatteBlack,
    surface: dark ? kSurface : const Color(0xFFFFFDF8),
    onSurface: dark ? kIvory : const Color(0xFF1A1814),
    error: const Color(0xFFB54A4A),
    onError: dark ? kIvory : const Color(0xFF1A1814),
  );
  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: dark ? kMatteBlack : const Color(0xFFF4F0E6),
    appBarTheme: AppBarTheme(
      backgroundColor: dark ? kMatteBlack : const Color(0xFFF4F0E6),
      foregroundColor: dark ? kGold : const Color(0xFF1A1814),
      elevation: 0,
      centerTitle: false,
    ),
    focusColor: kGold,
    cardTheme: CardThemeData(
      color: scheme.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0x33C9A227)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: dark ? const Color(0xFF1A1A1A) : const Color(0xFFFFFDF8),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kGold),
      ),
    ),
    segmentedButtonTheme: SegmentedButtonThemeData(
      style: ButtonStyle(
        foregroundColor: WidgetStateProperty.resolveWith((s) {
          return s.contains(WidgetState.selected) ? kMatteBlack : kIvory;
        }),
        backgroundColor: WidgetStateProperty.resolveWith((s) {
          return s.contains(WidgetState.selected) ? kGold : kSurface;
        }),
      ),
    ),
  );
}
