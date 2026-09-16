export const atieshTokens = {
  colors: {
    gold: '#c69b3d',
    goldLight: '#dfb85a',
    goldDark: '#8c6b22',
    goldGlow: 'rgba(198, 155, 61, 0.4)',
    arcane: '#0078ff',
    arcaneDark: '#004b9e',
    arcaneGlow: 'rgba(0, 120, 255, 0.35)',
    crimson: '#b31b1b',
    crimsonDark: '#7a1212',
    crimsonGlow: 'rgba(179, 27, 27, 0.35)',
    bgDark: '#0f172a',
    bgSurface: '#1e293b',
    bgCard: '#182234',
    border: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#38bdf8',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  fonts: {
    body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
} as const;

export type AtieshTokens = typeof atieshTokens;
