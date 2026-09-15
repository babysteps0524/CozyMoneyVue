import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind4,
} from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      dark: "media",
    }),

    presetAttributify(),

    presetIcons(),

    presetTypography(),
  ],

  theme: {
    colors: {
      cm: {
        bg: "#f7f8fa",
        surface: "#ffffff",
        surface2: "#f1f4f7",
        text: "#18212b",
        muted: "#66717d",
        line: "#dce2e8",
        primary: "#174a5b",
        accent: "#2a9d8f",

        dark: {
          bg: "#11161b",
          surface: "#1a2128",
          surface2: "#232c34",
          text: "#edf2f5",
          muted: "#aeb8c1",
          line: "#34414b",
          primary: "#3b8295",
          accent: "#45b8a8",
        },
      },
    },
  },

  shortcuts: {
    page: "mx-auto w-full max-w-1200px px-4 md:px-6",

    surface:
      "rounded-3xl border border-cm-line bg-cm-surface shadow-sm dark:border-cm-dark-line dark:bg-cm-dark-surface",

    focusRing:
      "focus-visible:outline-3 focus-visible:outline-cm-accent focus-visible:outline-offset-2",

    buttonPrimary:
      "inline-flex min-h-11 items-center justify-center rounded-xl bg-cm-primary px-4 font-700 text-white transition-opacity hover:opacity-90 active:scale-0.95",
  },
});
