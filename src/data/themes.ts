/*
 * Registry of live-switchable themes. Adding a palette is two steps: a CSS
 * file defining the full token contract under [data-theme="<id>"] (imported
 * in Base.astro) plus one entry here — nothing else knows the theme list.
 */
export interface ThemeOption {
  id: string;
  label: string;
}

export const THEMES: readonly ThemeOption[] = [
  { id: "arcane", label: "Arcane" },
  { id: "precision", label: "Precision" },
];

/*
 * Fired on window after <html data-theme> is swapped. CSS re-resolves on its
 * own; canvas layers (hero shader, Hero3D) sample token colors imperatively
 * and would keep stale palettes without this signal.
 */
export const THEME_CHANGE_EVENT = "chimera:themechange";
