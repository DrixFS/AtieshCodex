import { atieshTokens } from './tokens';

describe('atieshTokens', () => {
  it('should define core Atiesh Codex color palette', () => {
    expect(atieshTokens.colors.gold).toBe('#c69b3d');
    expect(atieshTokens.colors.arcane).toBe('#0078ff');
    expect(atieshTokens.colors.crimson).toBe('#b31b1b');
  });

  it('should define dark theme surface and background colors', () => {
    expect(atieshTokens.colors.bgDark).toBe('#0f172a');
    expect(atieshTokens.colors.bgSurface).toBe('#1e293b');
    expect(atieshTokens.colors.bgCard).toBe('#182234');
    expect(atieshTokens.colors.border).toBe('#334155');
  });

  it('should define typography and radius scales', () => {
    expect(atieshTokens.radii.sm).toBe('4px');
    expect(atieshTokens.radii.md).toBe('8px');
    expect(atieshTokens.radii.lg).toBe('12px');
    expect(atieshTokens.radii.full).toBe('9999px');
    expect(atieshTokens.fonts.body).toContain('Inter');
  });
});
