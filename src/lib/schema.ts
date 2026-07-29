import { SITE, absUrl } from './site'

type Dict = Record<string, unknown>

export const webApplication = (opts: {
  path: string
  name: string
  description: string
  features?: string[]
}): Dict => ({
  '@type': 'WebApplication',
  '@id': absUrl(opts.path) + '#app',
  name: opts.name,
  url: absUrl(opts.path),
  description: opts.description,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  isAccessibleForFree: true,
  featureList: opts.features,
  image: absUrl(SITE.ogImage),
  publisher: { '@id': SITE.url + '/#org' },
  isBasedOn: {
    '@type': 'CreativeWork',
    name: 'Microsoft Fluent Emoji',
    url: 'https://github.com/microsoft/fluentui-emoji',
  },
  inLanguage: 'en-US',
})

export const organization = (): Dict => ({
  '@type': 'Organization',
  '@id': SITE.url + '/#org',
  name: SITE.name,
  url: SITE.url + '/',
  logo: absUrl('/favicon.svg'),
})

export const breadcrumb = (items: { name: string; path: string }[]): Dict => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: absUrl(it.path),
  })),
})

export const faqPage = (path: string, items: { q: string; a: string }[]): Dict => ({
  '@type': 'FAQPage',
  '@id': absUrl(path) + '#faq',
  mainEntity: items.map((it) => ({
    '@type': 'Question',
    name: it.q,
    acceptedAnswer: { '@type': 'Answer', text: it.a },
  })),
})

export const howTo = (opts: {
  path: string
  name: string
  description: string
  steps: { name: string; text: string }[]
  totalTime?: string
}): Dict => ({
  '@type': 'HowTo',
  '@id': absUrl(opts.path) + '#howto',
  name: opts.name,
  description: opts.description,
  totalTime: opts.totalTime ?? 'PT2M',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
  tool: [{ '@type': 'HowToTool', name: 'A web browser' }],
  step: opts.steps.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
})

export const article = (opts: {
  path: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
}): Dict => ({
  '@type': 'Article',
  '@id': absUrl(opts.path) + '#article',
  headline: opts.headline,
  description: opts.description,
  datePublished: opts.datePublished,
  dateModified: opts.dateModified ?? opts.datePublished,
  author: { '@id': SITE.url + '/#org' },
  publisher: { '@id': SITE.url + '/#org' },
  mainEntityOfPage: absUrl(opts.path),
  image: absUrl(SITE.ogImage),
  inLanguage: 'en-US',
})

/** Wrap schema nodes into a single @graph JSON-LD document. */
export const graph = (...nodes: (Dict | null | undefined)[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
})
