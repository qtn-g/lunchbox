import { defineConfig } from 'vitepress';

export default defineConfig({
  description: 'CLI tools for committing, branching, and releasing packages',

  themeConfig: {
    nav: [
      { link: '/guide/getting-started', text: 'Guide' },
      {
        items: [
          { link: '/packages/commit/', text: 'Commit' },
          { link: '/packages/branch/', text: 'Branch' },
        ],
        text: 'Packages',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          items: [{ link: '/guide/getting-started', text: 'Getting Started' }],
          text: 'Introduction',
        },
      ],
      '/packages/branch/': [
        {
          items: [
            { link: '/packages/branch/', text: 'Overview' },
            { link: '/packages/branch/configuration', text: 'Configuration' },
          ],
          text: 'Branch',
        },
      ],
      '/packages/commit/': [
        {
          items: [
            { link: '/packages/commit/', text: 'Overview' },
            { link: '/packages/commit/configuration', text: 'Configuration' },
          ],
          text: 'Commit',
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/your-org/lunchbox' }],
  },
  title: 'Lunchbox',
});
