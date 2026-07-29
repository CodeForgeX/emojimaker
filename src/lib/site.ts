export const SITE = {
  url: 'https://emojimaker.cc',
  name: 'EmojiMaker',
  title: 'Emoji Maker — Create Custom Emojis Online (Free, No Sign-Up)',
  description:
    'Make your own emoji online: mix 100+ Fluent-style parts, then download as PNG or SVG. Free custom emoji maker — no sign-up, no watermark.',
  ogImage: '/banner.png',
  twitterCard: 'summary_large_image',
} as const

/** Absolute URL from a site-relative path. Always trailing-slash for pages. */
export const absUrl = (path: string) => new URL(path, SITE.url).href
