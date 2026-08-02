# EmojiMaker — Free Custom Emoji Tools

<p align="center">
  <img src="./public/banner.png" height="300" alt="EmojiMaker preview" />
</p>

<p align="center">
  <b>Live site: <a href="https://emojimaker.cc">emojimaker.cc</a></b><br>
  Free, open-source emoji tools — no sign-up, no watermark, everything runs in your browser.
</p>

## Tools

- **[Emoji Maker](https://emojimaker.cc/)** — mix 100+ Fluent-style parts (heads, eyes, eyebrows, mouths, details) into 200,000+ combinations; export PNG (640/512/128) or true SVG
- **[Emoji Kitchen Browser](https://emojimaker.cc/emoji-kitchen/)** — browse all 147,000+ official Google Emoji Kitchen mashups on any device, with copy/download and shareable combo links
- **[Emoji Combiner](https://emojimaker.cc/emoji-combiner/)** — overlay any two emojis into one transparent PNG
- **[Random Emoji Generator](https://emojimaker.cc/random-emoji-generator/)** — roll 1–20 random emojis and copy them in a click
- **Platform makers** — export exact sizes for [Slack](https://emojimaker.cc/slack-emoji-maker/) (128×128), [Discord](https://emojimaker.cc/discord-emoji-maker/) (128×128), [Twitch](https://emojimaker.cc/twitch-emote-maker/) (112/56/28 in one click) and [Microsoft Teams](https://emojimaker.cc/teams-emoji-maker/)
- **Guides & collections** — [emoji combinations to copy](https://emojimaker.cc/emoji-combinations/), [Genmoji prompts](https://emojimaker.cc/genmoji-prompts/), [Genmoji troubleshooting](https://emojimaker.cc/genmoji-not-working/), [how to make custom emojis](https://emojimaker.cc/guides/how-to-make-custom-emojis/)

Everything is composed client-side — nothing you create is uploaded anywhere.

## Tech stack

- [Astro 5](https://astro.build) — static multi-page architecture, every page fully rendered at build time
- [SolidJS](https://solidjs.com) islands for the interactive tools
- Plain CSS design tokens (light/dark), no CSS framework
- Cloudflare Pages for hosting

## Development

```bash
pnpm install
pnpm dev        # dev server
pnpm build      # production build to dist/
pnpm audit:seo  # on-page SEO checks over the built site
```

Other scripts:

- `node scripts/build-kitchen-data.mjs <metadata.json>` — regenerate the compact Emoji Kitchen pair database from [xsalazar/emoji-kitchen-backend](https://github.com/xsalazar/emoji-kitchen-backend)
- `node scripts/build-og-images.mjs` — regenerate per-page Open Graph images

## Credits

- Emoji artwork from [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft (MIT), remixed and partially modified
- Originally forked from [fluent-emoji-maker](https://github.com/ddiu8081/fluent-emoji-maker) by [Diu](https://github.com/ddiu8081) — since rebuilt as a multi-tool site
- Emoji Kitchen combination metadata via [xsalazar/emoji-kitchen-backend](https://github.com/xsalazar/emoji-kitchen-backend); mashup artwork © Google

## License

[MIT](./LICENSE)
