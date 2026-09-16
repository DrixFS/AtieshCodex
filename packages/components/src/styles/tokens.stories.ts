import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { atieshTokens } from './tokens';

const meta: Meta = {
  title: 'Design System / Design Tokens',
  render: () => {
    return html`
      <div
        style="font-family: var(--atiesh-font-family),serif; color: var(--atiesh-color-text-primary); padding: 1.5rem; max-width: 900px;"
      >
        <h1 style="color: var(--atiesh-color-gold); margin-bottom: 0.5rem;">
          Atiesh Codex — Design Tokens
        </h1>
        <p style="color: var(--atiesh-color-text-secondary); margin-bottom: 2rem;">
          Foundation design tokens, color palettes, and radii used across reusable web components
          and UI modules.
        </p>

        <h2
          style="color: var(--atiesh-color-gold-light); border-bottom: 1px solid var(--atiesh-color-border); padding-bottom: 0.5rem; margin-bottom: 1rem;"
        >
          Color Palette
        </h2>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2.5rem;"
        >
          ${Object.entries(atieshTokens.colors).map(
            ([name, value]) => html`
              <div
                style="background: var(--atiesh-color-bg-surface); border: 1px solid var(--atiesh-color-border); border-radius: var(--atiesh-radius-md); padding: 0.75rem; overflow: hidden;"
              >
                <div
                  style="background-color: ${value}; height: 48px; border-radius: var(--atiesh-radius-sm); margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.1);"
                ></div>
                <div style="font-weight: 600; font-size: 0.875rem;">${name}</div>
                <div
                  style="font-size: 0.75rem; color: var(--atiesh-color-text-muted); font-family: monospace;"
                >
                  ${value}
                </div>
              </div>
            `,
          )}
        </div>

        <h2
          style="color: var(--atiesh-color-gold-light); border-bottom: 1px solid var(--atiesh-color-border); padding-bottom: 0.5rem; margin-bottom: 1rem;"
        >
          Corner Radii
        </h2>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          ${Object.entries(atieshTokens.radii).map(
            ([name, value]) => html`
              <div
                style="background: var(--atiesh-color-bg-surface); border: 1px solid var(--atiesh-color-gold); border-radius: ${value}; padding: 1rem 1.5rem; text-align: center;"
              >
                <div style="font-weight: 600; font-size: 0.875rem;">radius-${name}</div>
                <div
                  style="font-size: 0.75rem; color: var(--atiesh-color-text-muted); font-family: monospace;"
                >
                  ${value}
                </div>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  },
};

export default meta;
export const Tokens: StoryObj = {};
