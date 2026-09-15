import { create } from "zustand"
import { persist } from "zustand/middleware"

export type FontScale = "sm" | "base" | "lg"

interface SettingsState {
  fontScale: FontScale
  highContrast: boolean
  setFontScale: (scale: FontScale) => void
  increaseFont: () => void
  decreaseFont: () => void
  toggleContrast: () => void
}

const order: FontScale[] = ["sm", "base", "lg"]

function apply(fontScale: FontScale, highContrast: boolean) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.setAttribute("data-font", fontScale)
  root.setAttribute("data-contrast", highContrast ? "high" : "normal")
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      fontScale: "base",
      highContrast: false,
      setFontScale: (fontScale) => {
        apply(fontScale, get().highContrast)
        set({ fontScale })
      },
      increaseFont: () => {
        const idx = Math.min(order.indexOf(get().fontScale) + 1, order.length - 1)
        const fontScale = order[idx]
        apply(fontScale, get().highContrast)
        set({ fontScale })
      },
      decreaseFont: () => {
        const idx = Math.max(order.indexOf(get().fontScale) - 1, 0)
        const fontScale = order[idx]
        apply(fontScale, get().highContrast)
        set({ fontScale })
      },
      toggleContrast: () => {
        const highContrast = !get().highContrast
        apply(get().fontScale, highContrast)
        set({ highContrast })
      },
    }),
    {
      name: "cpgrams-settings",
      onRehydrateStorage: () => (state) => {
        if (state) apply(state.fontScale, state.highContrast)
      },
    },
  ),
)
