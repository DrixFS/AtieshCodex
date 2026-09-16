import type { Preview } from '@storybook/web-components';
import '../src/styles/theme.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0f172a',
        },
        {
          name: 'alliance-blue',
          value: '#0d1b2a',
        },
        {
          name: 'horde-red',
          value: '#2b0c0c',
        },
        {
          name: 'light',
          value: '#f8fafc',
        },
      ],
    },
  },
};

export default preview;
