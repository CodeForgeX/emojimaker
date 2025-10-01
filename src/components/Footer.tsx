import { createSignal } from 'solid-js'

export default () => {
  const [showDetails, setShowDetails] = createSignal(false)

  return (
    <footer py-8 op-80>

      {/* Privacy & Security */}
      <p mt-2 text-center text-xs text-neutral-400 op-50>
        <i i-carbon:locked inline-block mr-1 />
        <span>All processing happens in your browser. No data is uploaded.</span>
      </p>

      {/* SEO Content Section - Collapsible */}
      <div mt-6 max-w-2xl mx-auto px-4>
        <button
          onClick={() => setShowDetails(!showDetails())}
          flex="~ row" items-center justify-center gap-2 w-full
          text-sm text-neutral-400 hover:text-violet-400
          transition-colors cursor-pointer
          aria-expanded={showDetails()}
          aria-controls="seo-details"
        >
          <span>Learn More About Emoji Maker</span>
          <i class={showDetails() ? 'i-carbon:chevron-up' : 'i-carbon:chevron-down'} text-xs />
        </button>

        {showDetails() && (
          <div
            id="seo-details"
            mt-4 space-y-4 text-sm text-neutral-400 text-left
            style="animation: fadeIn 0.3s ease-in;"
          >
            <h2 style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;">
              About Emoji Maker Tool
            </h2>
            <section>
              <h3 text-base font-semibold text-neutral-300 mb-2>What is Emoji Maker?</h3>
              <p leading-relaxed>
                Emoji Maker is a free online tool that lets you create custom emojis by mixing and matching different facial features.
                Choose from 100+ parts including heads, eyes, eyebrows, mouths, and decorative details to design unique emoji expressions.
                Perfect for designers, social media creators, and anyone who wants personalized emojis.
              </p>
            </section>

            <section>
              <h3 text-base font-semibold text-neutral-300 mb-2>Key Features</h3>
              <ul space-y-1 pl-5 list-disc leading-relaxed>
                <li><strong>5 Customizable Parts:</strong> Mix head shapes, eye styles, eyebrow expressions, mouth types, and decorative details</li>
                <li><strong>Random Generator:</strong> Instantly create unique emoji combinations with one click</li>
                <li><strong>Multiple Export Formats:</strong> Download as PNG (640x640px) for social media or SVG for scalable graphics</li>
                <li><strong>100% Free & Private:</strong> No sign-up required, all processing happens locally in your browser</li>
                <li><strong>Dark Mode Support:</strong> Comfortable editing in any lighting condition</li>
              </ul>
            </section>

            <section>
              <h3 text-base font-semibold text-neutral-300 mb-2>How to Use Emoji Maker</h3>
              <ol space-y-1 pl-5 list-decimal leading-relaxed>
                <li>Select a category tab (Head, Eyes, Eyebrows, Mouth, or Details)</li>
                <li>Click on different options to customize each part of your emoji</li>
                <li>Use the "Randomize" button to generate random combinations for inspiration</li>
                <li>Preview your creation in real-time on the canvas</li>
                <li>Export your custom emoji as PNG or SVG when you're satisfied</li>
              </ol>
            </section>

            <section>
              <h3 text-base font-semibold text-neutral-300 mb-2>Use Cases</h3>
              <p leading-relaxed>
                <strong>Social Media:</strong> Create unique profile pictures or reaction emojis for Discord, Slack, or Twitter.
                <strong class="ml-2">Design Projects:</strong> Generate custom icons for apps, websites, or presentations.
                <strong class="ml-2">Personal Expression:</strong> Design emojis that truly represent your mood or personality.
                <strong class="ml-2">Content Creation:</strong> Add personalized emojis to videos, streams, or digital content.
              </p>
            </section>
          </div>
        )}
      </div>
    </footer>
  )
}
