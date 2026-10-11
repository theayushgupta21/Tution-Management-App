import { Platform } from "react-native";

/* =====================================================================
   THEME  —  "Warm Chai" palette + Plus Jakarta Sans type system
   Purane saare keys (colors, spacing, radii, shadows, typography.*)
   waise hi hain, isliye existing screens nahi tootenge. Naye tokens
   upar se add hue hain (gradients, glass, status, motion, layout).
===================================================================== */

/* ---------- 1. Raw palette (ek hi jagah par hex) ---------- */
const palette = {
  // Brand: warm orange
  orange50: "#FFF3EB",
  orange100: "#FDE7DB",
  orange300: "#F4A074",
  orange500: "#E77A42",
  orange600: "#D66329",
  orange700: "#B94F1C",

  // Teal / sage (secondary)
  teal100: "#E4F5F0",
  teal500: "#6DB0A5",
  teal700: "#4F9488",

  // Support
  sun100: "#FFF2CC",
  sun500: "#F5BF5E",
  sky100: "#EAF3FF",
  sky500: "#8EB9E8",
  green100: "#EAF5E8",
  green500: "#73A86C",
  amber100: "#FFF2D9",
  amber500: "#E8B15A",
  red100: "#FDE5E0",
  red500: "#D96B5B",

  // Warm neutrals
  cream: "#FFF8ED",
  creamAlt: "#F9F3EA",
  creamMuted: "#F7F1EA",
  white: "#FFFFFF",
  brown900: "#2F221F",
  brown600: "#7B655D",
  brown400: "#A48D7F",
  line: "#F0E2D7",
  lineStrong: "#E4C9B3",
} as const;

/* ---------- 2. Helper: kisi bhi hex ko transparent version mein ---------- */
export const withAlpha = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/* ---------- 3. Fonts ----------
   Install:  npx expo install expo-font @expo-google-fonts/plus-jakarta-sans
   Root _layout.tsx mein useFonts() se load karna zaroori hai (neeche note).
   Custom font mein fontWeight kaam nahi karta, isliye har weight ka
   apna family name hai aur typography presets mein fontWeight nahi hai. */
export const fontFamily = {
  regular: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

// Root layout mein useFonts(fontAssets) ke liye
export const fontAssetNames = Object.values(fontFamily);

/* Purana export (navigation boilerplate ke liye) */
const tintColorLight = palette.orange500;
const tintColorDark = "#FFF7F0";

export const Colors = {
  light: {
    text: "#2A1F1B",
    background: palette.cream,
    tint: tintColorLight,
    icon: "#7E665C",
    tabIconDefault: "#9B867D",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#F7F1EB",
    background: "#1F1715",
    tint: tintColorDark,
    icon: "#E5D6C9",
    tabIconDefault: "#C7B3A7",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Georgia",
    rounded: "SF Pro Rounded",
    mono: "SFMono-Regular",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "'Plus Jakarta Sans', 'Poppins', 'Segoe UI', sans-serif",
    serif: "'Georgia', serif",
    rounded: "'Nunito', 'Poppins', 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', 'Consolas', monospace",
  },
});

/* ---------- 4. Main theme ---------- */
export const theme = {
  colors: {
    /* Brand */
    primary: palette.orange500,
    primaryStrong: palette.orange600,
    primaryDeep: palette.orange700, // pressed / dark text on soft bg
    primaryLight: palette.orange300,
    primarySoft: palette.orange100,
    primaryTint: palette.orange50,

    secondary: palette.teal500,
    secondaryStrong: palette.teal700,
    secondarySoft: palette.teal100,

    tertiary: palette.sun500,
    tertiarySoft: palette.sun100,

    info: palette.sky500,
    infoSoft: palette.sky100,

    /* Status */
    success: palette.green500,
    successSoft: palette.green100,
    warning: palette.amber500,
    warningSoft: palette.amber100,
    danger: palette.red500,
    dangerSoft: palette.red100,

    /* Surfaces */
    background: palette.cream,
    backgroundAlt: palette.creamAlt,
    neutral: palette.cream,
    card: palette.white,
    cardMuted: palette.creamMuted,
    darkAccent: palette.brown900,

    /* Text */
    textPrimary: palette.brown900,
    textSecondary: palette.brown600,
    textMuted: palette.brown400,
    onPrimary: palette.white, // primary background par text/icon

    /* Lines */
    border: palette.line,
    borderStrong: palette.lineStrong,
    white: palette.white,

    /* Misc */
    shadow: palette.brown900,
    overlay: "rgba(47, 34, 31, 0.12)",
    scrim: "rgba(47, 34, 31, 0.45)", // modal ke peeche
  },

  /* Gradients (expo-linear-gradient ke colors={...} mein seedha) */
  gradients: {
    primary: ["#F28F5B", "#E77A42", "#D66329"],
    hero: ["#F59A68", "#E26B30"],
    teal: ["#86C4B9", "#5FA79B"],
    sunrise: ["#FFF8ED", "#FDE7DB"], // halka background wash
  } as const,

  /* Glass (floating tab bar / overlays) */
  glass: {
    fill: "rgba(255, 248, 237, 0.55)",
    fillStrong: "rgba(255, 248, 237, 0.80)",
    border: "rgba(255, 255, 255, 0.70)",
    highlight: "rgba(255, 255, 255, 0.90)",
    blobSoft: "rgba(255, 255, 255, 0.14)", // splash / banner ke circles
  },

  /* Domain colors: ek jagah, har screen mein same meaning */
  status: {
    paid: { fg: palette.green500, bg: palette.green100 },
    pending: { fg: palette.red500, bg: palette.red100 },
    present: { fg: palette.green500, bg: palette.teal100 },
    absent: { fg: palette.red500, bg: palette.red100 },
    unmarked: { fg: palette.orange500, bg: palette.orange100 },
    whatsapp: { fg: "#FFFFFF", bg: "#25D366" },
  },

  spacing: {
    xxs: 4,
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 36,
  },

  radii: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    hero: 32,
    full: 999,
  },

  shadows: {
    card: {
      shadowColor: palette.brown900,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    soft: {
      shadowColor: palette.brown900,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 18,
      elevation: 4,
    },
    strong: {
      shadowColor: palette.brown900,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 7,
    },
    // Primary buttons / FAB ke neeche rangeen glow
    glow: {
      shadowColor: palette.orange500,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 8,
    },
  },

  /* Typography: Plus Jakarta Sans. fontWeight nahi, family se weight aata hai.
     Use:  fontStyle: { ...theme.typography.title } */
  typography: {
    display: {
      fontFamily: fontFamily.extrabold,
      fontSize: 34,
      lineHeight: 40,
      letterSpacing: -1,
      color: palette.brown900,
    },
    headline: {
      fontFamily: fontFamily.extrabold,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.8,
      color: palette.brown900,
    },
    title: {
      fontFamily: fontFamily.extrabold,
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.5,
      color: palette.brown900,
    },
    titleSm: {
      fontFamily: fontFamily.bold,
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.2,
      color: palette.brown900,
    },
    subtitle: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      lineHeight: 21,
      color: palette.brown600,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 21,
      color: palette.brown900,
    },
    bodyStrong: {
      fontFamily: fontFamily.bold,
      fontSize: 15,
      lineHeight: 21,
      color: palette.brown900,
    },
    caption: {
      fontFamily: fontFamily.semibold,
      fontSize: 12,
      lineHeight: 17,
      color: palette.brown600,
    },
    small: {
      fontFamily: fontFamily.semibold,
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 0.2,
      color: palette.brown600,
    },
    // Chhota uppercase label ("WELCOME BACK", "STUDENTS")
    eyebrow: {
      fontFamily: fontFamily.extrabold,
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 1.3,
      textTransform: "uppercase" as const,
      color: palette.brown600,
    },
    // Buttons ke andar ka text
    button: {
      fontFamily: fontFamily.extrabold,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    // Bade numbers (stats, count-up)
    stat: {
      fontFamily: fontFamily.extrabold,
      fontSize: 34,
      lineHeight: 40,
      letterSpacing: -1.2,
    },
  },

  /* Motion: sab screens mein ek hi speed aur stagger */
  motion: {
    duration: { fast: 120, base: 260, slow: 520 },
    stagger: 70,
    pressScale: 0.97,
    revealOffset: 18,
  },

  /* Layout: floating tab bar aur touch targets ke numbers */
  layout: {
    screenPadding: 20,
    touchTarget: 44,
    buttonHeight: 48,
    tabBarHeight: 68,
    tabBarGap: 12,
    // ScrollView/FlatList ke paddingBottom ke liye (tab bar ke peeche na chhupe)
    contentBottom: 120,
  },
};

export default theme;
