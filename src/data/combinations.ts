export interface ComboSection {
  heading: string
  note: string
  combos: string[]
}

export interface ComboCategory {
  slug: string
  name: string
  title: string
  description: string
  h1: string
  lede: string
  sections: ComboSection[]
  faq: { q: string; a: string }[]
}

export const COMBO_CATEGORIES: ComboCategory[] = [
  {
    slug: 'aesthetic',
    name: 'Aesthetic',
    title: 'Aesthetic Emoji Combinations to Copy (Soft, Dark, By Color)',
    description:
      'Tap-to-copy aesthetic emoji combinations: soft-girl, coquette, dark academia and color-coded combos (pink, blue, black, brown, green) for bios and usernames.',
    h1: 'Aesthetic Emoji Combinations',
    lede: 'Color-coordinated, mood-matched combos for bios, usernames, pinned comments and photo dumps — tap any combination to copy it.',
    sections: [
      {
        heading: 'Soft girl & coquette',
        note: 'Ribbons, strawberries and blush tones.',
        combos: ['🌷🍓🎀', '🎀🥛🍰', '🩰🎀🤍', '🍓🥞🎀', '🌸🧁💌', '🎀🦢🕯️', '🍒🎀📖', '🥡🍓🎀', '🌷📎🩰', '💌🍓🧸', '🎀☁️🥛', '🌸🍰🫖'],
      },
      {
        heading: 'Pink',
        note: 'The most-searched color combo family.',
        combos: ['🌸💗🦩', '🍧🎀💘', '💗🫧🌷', '🩷🍥🌸', '💒💗🌷', '🍑🌸🩷', '🎟️💗🍬', '💗🪞🌸', '🦩🍧💞', '🌸🩷📼'],
      },
      {
        heading: 'Blue & ocean',
        note: 'Cool tones, water, sky.',
        combos: ['🌊🐚🤍', '🫧🩵🐬', '💙🌌🫐', '🌀🩵❄️', '🐳💤🌙', '🧊🩵🫧', '⛲🕊️💙', '🌊📘🐋', '🩵🎐☁️', '🫐🌧️💙'],
      },
      {
        heading: 'Black & dark academia',
        note: 'Moody, gothic, candle-lit.',
        combos: ['🌙✨🖤', '🖤🥀⛓️', '🕯️📜🖤', '🗝️🕰️🖤', '🖤🩸🥀', '☕📖🖤', '🕸️🖤🌑', '🖤🪦🕯️', '⚰️🥀🖤', '🖤🎻🌘'],
      },
      {
        heading: 'Brown, beige & cozy',
        note: 'Latte tones and autumn neutrals.',
        combos: ['🤎🧸🍂', '☕🥐🤎', '🍂📜🕯️', '🤎🍪🧺', '🌰🍂🤎', '🥯☕🍂', '🤎📖🧣', '🍞🧈🤎', '🦫🌰🍂', '🤎🕰️🍂'],
      },
      {
        heading: 'Green & nature',
        note: 'Matcha, moss and garden energy.',
        combos: ['🍵🌿📗', '🐢🌱💚', '🍀🌿🫛', '💚🦎🌴', '🌿🍈🫧', '🥝🌱💚', '🍃🐸🎋', '💚🌵🌿', '🫒🌿📗', '🌱🦖💚'],
      },
    ],
    faq: [
      {
        q: 'What makes an emoji combination “aesthetic”?',
        a: 'Aesthetic combos stick to one palette or mood — all pink, all moody-dark, all matcha-green — usually 3 emojis: a subject, a texture and an accent (like 🌊🐚🤍). Matching tones read as intentional instead of random.',
      },
      {
        q: 'Where do people use aesthetic emoji combos?',
        a: 'Instagram and TikTok bios, username decorations, Discord statuses, photo-dump captions, Notion headers and pinned comments. Copy one above and paste it anywhere text works.',
      },
    ],
  },
  {
    slug: 'cute',
    name: 'Cute',
    title: 'Cute Emoji Combinations to Copy & Paste (60+ Soft Combos)',
    description:
      'The softest cute emoji combinations to copy: baby animals, snacks, cozy vibes and wholesome love combos for captions, comments and usernames.',
    h1: 'Cute Emoji Combinations',
    lede: 'Maximum softness: baby animals, snacks and cozy moments — tap any combo to copy it for captions, comments and usernames.',
    sections: [
      {
        heading: 'Baby animals',
        note: 'Instant serotonin.',
        combos: ['🐰🥕💗', '🐻🍯🧡', '🐥🌻☀️', '🐨🌿💚', '🦔🍄🍂', '🐳💦🩵', '🐹🌰🤎', '🐧❄️💙', '🦊🍁🧡', '🐢🌱🌼', '🐣🐰🌷', '🐱🧶💗', '🦦🐚💙', '🐮🌼🥛'],
      },
      {
        heading: 'Snacks & sweets',
        note: 'Food but make it adorable.',
        combos: ['🍓🥞🤍', '🧁🎀💕', '🍡🌸🍵', '🍦🧇🤎', '🥟🍜🤍', '🍪🥛🧸', '🍧🍒💗', '🥐☕🐻', '🍰🍓🎀', '🧋🤎🐻', '🍙🍱🌸', '🥨🧀🧡'],
      },
      {
        heading: 'Cozy moments',
        note: 'Blankets, rain and nap energy.',
        combos: ['😽💤🌙', '🧸🌙⭐', '☁️🛏️💤', '🧦🔥📖', '🌧️🫖🧣', '🐻☕🍞', '💤🌙🎐', '🛁🫧🕯️', '🧸📺🌙', '🌙🥛🍪'],
      },
      {
        heading: 'Wholesome love',
        note: 'Sweet without being cheesy.',
        combos: ['💌💗🕊️', '🌷💞🐇', '💐💗🍓', '🫶💗🌸', '💘🧸🎀', '🌼💛🐝', '💗✉️🌷', '🥰💐☀️', '💞🦢🤍', '💗🍓📸'],
      },
    ],
    faq: [
      {
        q: 'What are the cutest emoji combinations?',
        a: 'The formula is animal + prop + heart in matching tones: 🐰🥕💗, 🐻🍯🧡, 🐥🌻☀️. Keep it to three emojis and one color family — cuteness comes from cohesion.',
      },
      {
        q: 'Can I use these combos on WhatsApp and iMessage?',
        a: 'Yes — they’re standard Unicode emojis, so they work in any chat app, bio or caption. Rendering styles differ slightly between Apple, Google and Samsung, but the combo reads the same.',
      },
    ],
  },
  {
    slug: 'funny',
    name: 'Funny',
    title: 'Funny Emoji Combinations: 60+ Chaotic Combos to Copy',
    description:
      'Funny emoji combinations that tell a whole story in three characters: chaotic energy, dark humor, deadpan reactions and unhinged classics — tap to copy.',
    h1: 'Funny Emoji Combinations',
    lede: 'Combos that tell a whole story in three characters — chaotic, deadpan and slightly unhinged. Tap to copy.',
    sections: [
      {
        heading: 'Chaotic energy',
        note: 'For when everything is on fire (affectionately).',
        combos: ['🤡🎪🎉', '🏃💨🚪', '🔥🧯🙂', '🚨🏃📸', '🎢😵🌀', '⛽🔥💃', '🧨😌🎇', '🌪️🧍☕', '🚗💨🦵', '🎳💥🧍‍♂️'],
      },
      {
        heading: 'Dark humor & deadpan',
        note: 'Coffee-powered skull energy.',
        combos: ['💀☕🧍', '🗿🍷🌊', '⚰️💃🎉', '💀📉🙃', '🥀🧎😔', '🪦😌✌️', '💀🔔🕺', '🙂🔪🎂', '😶‍🌫️📄🖊️', '💀🛒🧾'],
      },
      {
        heading: 'Reaction combos',
        note: 'Paste these instead of typing a reply.',
        combos: ['👁️👄👁️', '😤💅✨', '😭✋🚫', '🤨📸📢', '🫡📋✅', '🧠❌📉', '👀🍿🪑', '🙄🎻😢', '🫠🪑🔥', '😮‍💨📉🧾'],
      },
      {
        heading: 'Absurd classics',
        note: 'No explanation, maximum impact.',
        combos: ['🤠🔫🐴', '🐸🍵🫖', '🦶🔪😱', '🐔🧠❓', '💃🕺🔥', '🥴🌈🧠', '🦖📞🕴️', '🧍‍♀️🧍‍♂️🌵', '🐟🚲❓', '🥫🔨🎺'],
      },
    ],
    faq: [
      {
        q: 'How do funny emoji combinations work?',
        a: 'The joke is the sequence: setup, subject, punchline — 💀☕🧍 reads as “dead, but coffee, so upright”. Three emojis is the sweet spot; a fourth usually kills the timing.',
      },
      {
        q: 'What does 👁️👄👁️ mean?',
        a: 'It’s the classic “watching something unhinged unfold and saying nothing” face — wide eyes, tiny mouth. Use it as a reaction when words would be too much.',
      },
    ],
  },
  {
    slug: 'christmas',
    name: 'Christmas',
    title: 'Christmas Emoji Combinations to Copy (Festive & Cozy)',
    description:
      'Christmas emoji combinations to copy: cozy December, classic festive, snow day and New Year combos for bios, group chat names, captions and cards.',
    h1: 'Christmas Emoji Combinations',
    lede: 'Festive combos for December bios, group-chat names, captions and cards — tap any combination to copy it.',
    sections: [
      {
        heading: 'Classic festive',
        note: 'Tree, gifts, Santa — the essentials.',
        combos: ['🎄✨🎁', '🦌🔔🎅', '🌟🎄🤍', '🎁💝🎀', '🎄🍪🥛', '🎅🛷🌙', '🔔🎶🎄', '🎄❤️💚', '🤶🍪❄️', '🎁🧦🎄'],
      },
      {
        heading: 'Cozy December',
        note: 'Fireplace-and-cocoa energy.',
        combos: ['🧦🔥🍫', '☕🧣🌨️', '🕯️🎶📖', '🧸🎄🌙', '🍪🥛🧦', '🔥🛋️❄️', '🧤☕🎄', '🌰🔥🎶', '🫖🍊🕯️', '🧣🦌🤎'],
      },
      {
        heading: 'Snow day',
        note: 'White-and-blue winter palette.',
        combos: ['☃️❄️💙', '🛷❄️🌨️', '⛄🧣☕', '❄️🤍✨', '🌨️🏔️💙', '⛸️❄️🎶', '☃️🥕🎩', '❄️🦢🤍', '🧊🌙❄️', '🌨️🐧💙'],
      },
      {
        heading: 'New Year',
        note: 'For the December 31 pivot.',
        combos: ['🎆🥂✨', '🕛🎇🥳', '🍾🎊🌟', '✨🥂🕛', '🎇🖤✨', '🎊🪩🥂', '🌟🎆🍾', '🥂💫🎉'],
      },
    ],
    faq: [
      {
        q: 'When should I switch my bio to Christmas combos?',
        a: 'Most people flip right after Thanksgiving (late November) and keep them through New Year — swap to a 🎆🥂✨ combo on December 31, then back to your usual aesthetic in January.',
      },
      {
        q: 'What’s a good Christmas group chat name combo?',
        a: 'Pair a festive combo with the name: “Family 🎄✨🎁”, “Cookie Crew 🍪🥛🧦”, “Ski Trip ☃️❄️💙”. Short combos read best next to text.',
      },
    ],
  },
  {
    slug: 'halloween',
    name: 'Halloween',
    title: 'Halloween Emoji Combinations: Spooky Combos to Copy',
    description:
      'Halloween emoji combinations to copy: classic spooky, cursed-cute, witchy and autumn combos for October bios, usernames, captions and party invites.',
    h1: 'Halloween Emoji Combinations',
    lede: 'Spooky-season combos for October bios, usernames and captions — from classic haunted to cursed-cute. Tap to copy.',
    sections: [
      {
        heading: 'Classic spooky',
        note: 'The haunted-house starter pack.',
        combos: ['🎃👻🕸️', '🦇🌕🖤', '💀🕯️📖', '🕷️🕸️🎃', '⚰️🥀🖤', '👻🏚️🌫️', '🎃🔮🌙', '🩸🧛🌹', '💀🎃🔥', '🪦👻🌙'],
      },
      {
        heading: 'Witchy',
        note: 'Potions, spells and moon phases.',
        combos: ['🧙‍♀️🔮✨', '🌙🕯️🧹', '🔮🖤🌘', '🧪🍄🌙', '🕯️📜🔮', '🌕🧙‍♀️🦉', '🃏🔮🖤', '🧹⭐🌙', '🪄🕸️🌘', '🔮🐈‍⬛✨'],
      },
      {
        heading: 'Cursed cute',
        note: 'Spooky but make it adorable.',
        combos: ['👻🍬💗', '🎃🧸🍂', '🦇🎀🖤', '👻🌷🕯️', '🐈‍⬛💗🌙', '🍬👻🎀', '🎃💛🧡', '🕸️🎀🖤', '👻🍪🥛', '🦴🐶🎃'],
      },
      {
        heading: 'Candy & party',
        note: 'Trick-or-treat haul energy.',
        combos: ['🍬🍭👻', '🍫🎃🍬', '🧟🪩🎉', '🍭🦇🎶', '🎃🍕👾', '🍬🧛🥤', '👻🎊🕺', '🍫💀🎈'],
      },
    ],
    faq: [
      {
        q: 'When do Halloween emoji combos start showing up?',
        a: 'Bios and usernames go spooky in late September; peak is the first week of October through November 1. After that, most people pivot to autumn neutrals (🤎🍂🕯️) until Thanksgiving.',
      },
      {
        q: 'What’s the difference between spooky and cursed-cute combos?',
        a: 'Spooky combos stay in the dark palette (🖤🦇🌕); cursed-cute mixes one scary emoji with soft ones (👻🍬💗). Cursed-cute reads playful — better for personal accounts than party invites.',
      },
    ],
  },
]
