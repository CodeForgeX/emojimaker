import { defineConfig } from 'astro/config'
import solidJs from '@astrojs/solid-js'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://emojimaker.cc',
  trailingSlash: 'ignore',
  integrations: [
    solidJs(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        if (item.url === 'https://emojimaker.cc/') item.priority = 1.0
        return item
      },
    }),
  ],
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
})
