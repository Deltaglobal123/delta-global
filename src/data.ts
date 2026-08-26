/**
 * All page copy lives here so components stay presentational.
 *
 * Marketing text is reproduced verbatim from the Delta Global Operations site.
 * Anything that needs a real-world fact the site did not provide is left as a
 * <Placeholder> slot in the page rather than invented here.
 */

/* --------------------------------- routing -------------------------------- */

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'Features', to: '/#features' },
  { label: 'Strategies', to: '/#strategies' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About us', to: '/about' },
  { label: 'FAQ', to: '/#faq' },
  { label: 'Contact', to: '/contact' },
] as const

/** The nav "Login" button — the real JWT sign-in screen. */
export const LOGIN_URL = '/login'

export const LEGAL_LINKS = [
  { label: 'Risk disclosure', to: '/legal/risk-disclosure' },
  { label: 'Terms of service', to: '/legal/terms' },
  { label: 'Privacy policy', to: '/legal/privacy' },
  { label: 'Refund policy', to: '/legal/refunds' },
] as const

/* --------------------------------- pricing -------------------------------- */

export type Plan = {
  id: string
  name: string
  price: string
  tagline: string
  features: string[]
  featured?: boolean
}

/**
 * A single plan at ₹999. The three earlier tiers each carried their own
 * "Guaranteed profit return" figure (25k+ / 65k+ / 1L+) tied to their own price;
 * none of those figures transfers to a ₹999 plan, so no return figure is stated
 * here. Add one only if it is a real, contractual number — and see the
 * [REVIEW REQUIRED] note in RISK_DISCLOSURE first.
 *
 * The rest of the plan renders from this array, so adding tiers back restores
 * the multi-card grid and the comparison table without further edits.
 */
export const PLANS: Plan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: '999',
    tagline: 'Full platform access. One price.',
    featured: true,
    features: [
      'AI market analysis',
      'Strategy library and activation',
      'Portfolio dashboard',
      'Transaction history',
      'Performance analytics',
      'Configurable risk controls',
    ],
  },
]

export const PRICING_INTRO = {
  badge: 'Pricing',
  heading: 'Simple pricing. Clear access.',
  body: 'One plan with access to the tools and features you need — analysis, strategies, dashboard and risk controls.',
}

/* ---------------------------------- hero ---------------------------------- */

export const HERO = {
  badge: 'AI-powered trading platform',
  title: 'Trade smarter with AI-powered strategies',
  gradient: 'Built for data. Designed for control.',
  body: [
    'Use intelligent market analysis, automated strategies and real-time portfolio insights to make your trading workflow more systematic.',
    'Our platform brings strategy execution, market monitoring, risk controls and performance tracking together in one powerful workspace.',
  ],
  trust: [
    'AI-assisted market analysis',
    'Automated strategy execution',
    'Real-time portfolio monitoring',
  ],
  disclaimer:
    'Trading involves market risk. Past performance or backtested results do not guarantee future performance.',
}

export const HERO_STATS = [
  {
    label: 'AI market analysis',
    value: '24/7',
    body: 'Monitor market data and strategy conditions.',
  },
  {
    label: 'Risk controls',
    value: 'Built-in',
    body: 'Set predefined risk and trading limits.',
  },
  {
    label: 'Real-time tracking',
    value: 'Live',
    body: 'Track positions, P&L and strategy activity from one dashboard.',
  },
]

/* -------------------------------- sections -------------------------------- */

/** The shape every card-grid section on the home page renders from. */
export type Card = { title: string; body: string }

export const INTRO = {
  badge: 'The AI trading edge',
  heading: 'Turn market data into a smarter trading workflow',
  body: [
    'Markets move quickly. Manually tracking every signal, indicator and position can make trading difficult to manage.',
    'Our AI-powered platform helps simplify the process by combining market data, strategy rules and intelligent analysis into one centralized trading environment.',
  ],
  cards: [
    {
      title: 'AI market intelligence',
      body: 'Analyze market conditions using data-driven models and technical indicators to identify potentially relevant market patterns.',
    },
    {
      title: 'Automated strategies',
      body: 'Create or activate predefined trading strategies and let the platform monitor market conditions according to your selected rules.',
    },
    {
      title: 'Portfolio intelligence',
      body: 'Track positions, balances, performance and trading activity through a centralized dashboard.',
    },
  ] satisfies Card[],
}

export const STEPS_INTRO = {
  badge: 'How it works',
  heading: 'From account setup to intelligent execution',
  body: 'Get started in a few simple steps and maintain control throughout the trading process.',
}

export const STEPS = [
  {
    n: '01',
    title: 'Create your account',
    body: 'Register securely and complete the required account verification process.',
  },
  {
    n: '02',
    title: 'Fund your trading wallet',
    body: 'Add funds through the supported payment process. Your transaction status is visible from your account.',
  },
  {
    n: '03',
    title: 'Choose your strategy',
    body: 'Explore available strategies and review their methodology, historical or backtested information and associated risks before activating one.',
  },
  {
    n: '04',
    title: 'Activate AI trading',
    body: 'Start your selected strategy and allow the platform to monitor market conditions according to its defined rules.',
  },
  {
    n: '05',
    title: 'Monitor your portfolio',
    body: 'View active positions, transactions, available balance, P&L and strategy activity from your dashboard.',
  },
  {
    n: '06',
    title: 'Manage your funds',
    body: "Review your wallet and transaction history and use the available withdrawal process according to the platform's applicable terms.",
  },
]

export const AI_TRADING = {
  badge: 'Intelligent trading',
  heading: 'AI that helps you trade with a system',
  body: 'Instead of relying entirely on manual monitoring, our platform combines market data, predefined strategy logic and AI-assisted analysis to help create a more structured trading workflow.',
  cards: [
    {
      title: 'Market scanning',
      body: 'Monitor selected instruments and identify conditions that match your configured strategy.',
    },
    {
      title: 'Pattern analysis',
      body: 'Analyze technical and market signals to help identify potentially significant patterns.',
    },
    {
      title: 'Strategy engine',
      body: 'Apply predefined rules consistently without manually repeating the same analysis.',
    },
    {
      title: 'Real-time signals',
      body: 'Receive updates when defined strategy conditions are met.',
    },
    {
      title: 'Risk management',
      body: 'Configure trading limits and risk controls before activating a strategy.',
    },
    {
      title: 'Performance analytics',
      body: 'Review strategy activity, transactions, P&L and historical performance in one place.',
    },
  ] satisfies Card[],
}

export const DASHBOARD = {
  badge: 'Your trading command center',
  heading: 'Everything you need. One dashboard.',
  body: 'Get a complete view of your trading activity without switching between multiple platforms.',
  cards: [
    {
      title: 'Portfolio overview',
      body: 'See your total portfolio value, available balance and current P&L.',
    },
    {
      title: 'Active strategies',
      body: 'View which strategies are currently running and their current status.',
    },
    {
      title: 'Open positions',
      body: 'Monitor active trades, entry prices, current prices and position performance.',
    },
    {
      title: 'Transaction history',
      body: 'View deposits, withdrawals, trades and other wallet transactions.',
    },
    {
      title: 'Performance analytics',
      body: 'Analyze strategy performance using historical trading data and key metrics.',
    },
    {
      title: 'Risk monitor',
      body: 'Keep track of predefined exposure and trading limits.',
    },
  ] satisfies Card[],
}

export type Strategy = {
  id: string
  name: string
  body: string
  bestFor: string
  risk: string
  cta: string
}

export const STRATEGIES = {
  badge: 'Strategies',
  heading: 'Choose a strategy that fits your trading approach',
  body: 'Explore different strategy models designed around different market conditions and trading styles.',
  items: [
    {
      id: 'trend',
      name: 'Trend strategy',
      body: 'Designed to identify potential market momentum and trend-following conditions.',
      bestFor: 'Trending markets',
      risk: 'Market dependent',
      cta: 'View strategy',
    },
    {
      id: 'momentum',
      name: 'Momentum strategy',
      body: 'Uses momentum-based indicators and predefined conditions to identify potential opportunities.',
      bestFor: 'Momentum-driven markets',
      risk: 'Market dependent',
      cta: 'View strategy',
    },
    {
      id: 'mean-reversion',
      name: 'Mean reversion strategy',
      body: 'Designed around the concept that certain price movements may revert toward historical levels.',
      bestFor: 'Range-bound conditions',
      risk: 'Market dependent',
      cta: 'View strategy',
    },
    {
      id: 'custom',
      name: 'Custom strategy',
      body: 'Create or configure a strategy according to supported rules and parameters.',
      bestFor: 'Advanced users',
      risk: 'Depends on configuration',
      cta: 'Build strategy',
    },
  ] satisfies Strategy[],
}

export const WHY_US = {
  badge: 'Why Delta Global',
  heading: 'Technology that puts control first',
  body: 'AI can make analysis faster, but trading decisions still require responsible risk management. Our platform is designed around transparency, visibility and user control.',
  cards: [
    {
      title: 'Transparent activity',
      body: 'See what your strategies are doing through clear activity and transaction records.',
    },
    {
      title: 'User control',
      body: 'Start, stop and manage strategies from your dashboard.',
    },
    {
      title: 'Data-driven',
      body: 'Use market data and defined strategy logic rather than relying purely on emotion.',
    },
    {
      title: 'Risk-aware',
      body: 'Configure limits and understand potential downside before activating a strategy.',
    },
    {
      title: 'Simple interface',
      body: 'Access complex trading tools through a clean and intuitive interface.',
    },
    {
      title: 'Performance visibility',
      body: 'Track historical activity and current portfolio performance in one place.',
    },
  ] satisfies Card[],
}

export const SECURITY = {
  badge: 'Security & control',
  heading: 'Your account. Your data. Your control.',
  body: 'We design the platform with security and transparency in mind, helping users maintain visibility over account activity and transactions.',
  cards: [
    {
      title: 'Secure authentication',
      body: 'Protected account access and verification.',
    },
    {
      title: 'Transaction records',
      body: 'Maintain visibility into deposits, withdrawals and trading activity.',
    },
    {
      title: 'Account monitoring',
      body: 'Review important account events from your dashboard.',
    },
    {
      title: 'Risk controls',
      body: 'Use configurable limits to help manage trading exposure.',
    },
  ] satisfies Card[],
}

export const PERFORMANCE = {
  badge: 'Performance & transparency',
  heading: 'See the data. Understand the risk.',
  body: [
    'Trading performance should be evaluated using meaningful data rather than promises.',
    'Where historical or backtested performance is displayed, the methodology, timeframe, assumptions, fees and limitations are identified alongside it.',
  ],
  metrics: [
    {
      title: 'Win rate',
      body: 'Percentage of historical trades that were profitable.',
    },
    {
      title: 'Drawdown',
      body: 'Historical decline from a peak value.',
    },
    {
      title: 'Profit factor',
      body: 'Comparison between gross profits and gross losses.',
    },
    {
      title: 'Risk / reward',
      body: 'Relationship between potential gains and potential losses.',
    },
    {
      title: 'Total trades',
      body: 'Number of trades included in the selected period.',
    },
  ] satisfies Card[],
  disclaimer:
    'Past performance and backtested results are not indicative of future performance. Actual trading results may differ significantly.',
}

export const TESTIMONIALS = {
  badge: 'What users say',
  heading: 'Built for traders who value clarity',
  body: 'Only quotes from real customers who have given written permission to be named belong here.',
}

export const RESPONSIBLE = {
  badge: 'Trade responsibly',
  heading: 'Technology can automate a strategy. It cannot eliminate risk.',
  body: [
    'Every financial market involves risk. Before using any strategy, understand how it works, evaluate the potential downside and use only capital you can afford to lose.',
    'Do not make investment decisions solely because of historical performance, AI-generated analysis or automated signals.',
    'For users in India, this platform must clearly disclose its regulatory status and must not present itself as a SEBI-registered investment adviser, broker or other regulated entity unless that status actually applies. SEBI has specifically cautioned investors about unregulated algorithmic-trading platforms and misleading return claims.',
  ],
  cta: 'Read risk disclosure',
}

/* --------------------------------- awards --------------------------------- */

/**
 * Transcribed from the badge artwork supplied by the client — nothing here is
 * inferred or upgraded. Every badge reads "FINALIST", so `status` stays
 * "Finalist" on all three; do not render these as wins.
 *
 * Before launch, confirm the awarding body's badge usage rules and that the
 * finalist listing was awarded to the legal entity that operates this site.
 * The badge images belong in public/awards/ under the filenames in `image`.
 */
export type Award = {
  id: string
  year: string
  status: string
  category: string
  region: string
  awardedBy: string
  note: string
  image: string
  alt: string
}

export const AWARDS_INTRO = {
  eyebrow: 'Recognition',
  heading: 'Judged by outsiders, three years running',
  lead: 'The Better Business Awards are run by The Adviser and judged independently against written submissions and client evidence. Our team has been named a finalist in the NSW/ACT field in 2022, 2023 and 2024.',
  footnote:
    'Finalist recognition in The Adviser Better Business Awards, NSW/ACT region. Judging assesses process, conduct and client service — it is not an endorsement of any product and carries no assurance about the outcome of any individual engagement.',
}

export const AWARDS: Award[] = [
  {
    id: 'bba-2022',
    year: '2022',
    status: 'Finalist',
    category: 'Best Customer Service (Office)',
    region: 'NSW/ACT',
    awardedBy: 'The Adviser Better Business Awards',
    note: 'A whole-office category: how quickly clients get answered, how well they are kept informed, and what the service looks like after the paperwork is signed.',
    image: '/awards/better-business-2022-customer-service.png',
    alt: 'The Adviser Better Business Awards 2022 finalist badge — Best Customer Service (Office), NSW/ACT',
  },
  {
    id: 'bba-2023',
    year: '2023',
    status: 'Finalist',
    category: 'Broker of the Year',
    region: 'NSW/ACT',
    awardedBy: 'The Adviser Better Business Awards',
    note: 'The individual category, judged on client outcomes, professional conduct and sustained performance across the year rather than volume alone.',
    image: '/awards/better-business-2023-broker-of-the-year.png',
    alt: 'The Adviser Better Business Awards 2023 finalist badge — Broker of the Year, NSW/ACT',
  },
  {
    id: 'bba-2024',
    year: '2024',
    status: 'Finalist',
    category: 'Best Finance Brokerage',
    region: 'NSW/ACT',
    awardedBy: 'The Adviser Better Business Awards',
    note: 'The business-wide category, assessing the operation end to end — process, compliance, team capability and the results clients were left with.',
    image: '/awards/better-business-2024-finance-brokerage.png',
    alt: 'The Adviser Better Business Awards 2024 finalist badge — Best Finance Brokerage, NSW/ACT',
  },
]

/* ---------------------------------- about --------------------------------- */

export const ABOUT = {
  eyebrow: 'About us',
  heading: 'A team dedicated to your career growth',
  lead: 'We are a group of career strategists, coaches, and industry professionals united by one goal: helping ambitious people turn uncertainty into opportunity',
  philosophyTitle: 'Our philosophy',
  philosophy:
    'Our mission is to empower organizations by providing seamless, secure, and efficient operational frameworks. We believe that work from home and Investment should be the invisible backbone of a successful people, allowing our clients to focus on growth while we handle the risks.',
  differenceTitle: "The difference you'll experience",
}

export const FOUNDER = {
  quote:
    "India's youngest billionaires with a net worth of $2.6 billion, as per Forbes, and has disrupted the broking market in India. At just the age of 38, he has built a niche for himself in the financial world and is the motivation for many with his perseverance, ambition, and innovation.",
  name: 'Nikhil Kamath',
  role: 'Co-founder of Zerodha and Delta Global Operations',
  initials: 'NK',
  stats: [
    { value: '$2.6B', label: 'Net worth, per Forbes' },
    { value: '38', label: 'Age' },
  ],
}

export const CTA = {
  badge: 'Ready to get started?',
  heading: 'Build a smarter trading workflow with AI.',
  body: 'Explore our platform, understand the strategies and take control of your trading experience with data-driven tools.',
  button: 'Create your account',
  secondary: 'Explore features',
}

/* ----------------------------------- faq ---------------------------------- */

export const FAQS = [
  {
    q: 'What is AI trading?',
    a: 'AI trading refers to the use of artificial intelligence, data analysis and automated systems to assist with market analysis, strategy evaluation or trading-related processes.',
  },
  {
    q: 'Does AI guarantee profits?',
    a: 'No. AI cannot guarantee trading profits. Markets are unpredictable and losses are possible.',
  },
  {
    q: 'Can I stop a strategy?',
    a: 'Yes, where supported by the platform, users can stop or deactivate active strategies from their dashboard.',
  },
  {
    q: 'Can I see my transactions?',
    a: 'Yes. Your dashboard provides access to relevant deposit, withdrawal and trading transaction records.',
  },
  {
    q: 'Can I withdraw my funds?',
    a: "Withdrawals are subject to the platform's applicable process, verification requirements, terms and any relevant restrictions.",
  },
  {
    q: 'Is AI trading risk-free?',
    a: 'No. AI and automation do not remove market risk. Automated systems can also execute decisions quickly, so appropriate risk controls are important.',
  },
  {
    q: 'Are returns guaranteed?',
    a: 'No. We do not guarantee returns or promise fixed profits.',
  },
  {
    q: 'Is my money insured?',
    a: '[REVIEW REQUIRED] Do not answer this until you can document an actual, legally applicable protection arrangement. If there is none, say so plainly here — claiming that funds are insured or losses are covered without a real arrangement behind it is the single most dangerous sentence you can put on this site.',
  },
]

export const FAQ_INTRO = {
  badge: 'FAQ',
  heading: 'Questions, answered',
  body: 'How the platform works, what it does not do, and where the risk sits.',
}

export const COPYRIGHT = '© 2026 Delta Global. All rights reserved.'

/**
 * Footer columns. "Trading guide" and "Documentation" from the content brief are
 * omitted because no such pages exist yet — a dead nav link costs more trust
 * than a missing one. Add them here once the pages are built.
 */
export const FOOTER = {
  blurb: 'AI-powered tools for a more structured trading experience.',
  columns: [
    {
      title: 'Platform',
      links: [
        { label: 'Home', to: '/' },
        { label: 'Features', to: '/#features' },
        { label: 'Strategies', to: '/#strategies' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Dashboard', to: '/#dashboard' },
        { label: 'How it works', to: '/#how-it-works' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'FAQ', to: '/#faq' },
        { label: 'Risk disclosure', to: '/legal/risk-disclosure' },
        { label: 'Support', to: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms & conditions', to: '/legal/terms' },
        { label: 'Privacy policy', to: '/legal/privacy' },
        { label: 'Risk disclosure', to: '/legal/risk-disclosure' },
        { label: 'Refund & cancellation policy', to: '/legal/refunds' },
        { label: 'Regulatory information', to: '/legal/risk-disclosure' },
      ],
    },
  ],
  disclaimer:
    'Trading and investing in financial markets involve substantial risk of loss. Past performance, simulated results and backtested results do not guarantee future results. AI-generated analysis or automated strategies may be inaccurate and should not be treated as a guarantee of performance. Users should independently evaluate the risks and seek advice from an appropriately qualified or registered professional where required.',
}

/* ---------------------------------- legal --------------------------------- */

export type LegalDoc = {
  title: string
  updated: string
  intro: string
  sections: { heading: string; body: string[] }[]
}

/**
 * Skeletons only. Every bracketed value must be replaced with the real
 * registered detail, and the finished text reviewed by a lawyer before launch.
 */
export const RISK_DISCLOSURE: LegalDoc = {
  title: 'Risk disclosure',
  updated: '[Date]',
  intro:
    'This disclosure explains the risks of the services offered on this site. Read it in full before you pay for any plan.',
  sections: [
    {
      heading: 'Market risk',
      body: [
        'Trading and investment in financial markets carries risk, including the risk of losing some or all of the capital you commit. Past performance is not indicative of future results.',
        'No outcome in a market-linked activity can be known in advance. Any figure shown on this site that describes a future return must be presented as a target or an illustration, never as an assurance.',
      ],
    },
    {
      heading: 'No assured returns',
      body: [
        '[REVIEW REQUIRED] Under SEBI regulations, entities providing investment advice or portfolio services in India are not permitted to promise or guarantee assured returns. The plan descriptions currently used on this site describe "Guaranteed profit return" and "100% Loss cover".',
        'Confirm with your legal counsel whether your offering is a market-linked service, and if it is, revise the plan copy before launch. This section should then state plainly that returns are not guaranteed.',
      ],
    },
    {
      heading: 'Regulatory status',
      body: [
        '[Entity legal name] is registered in [jurisdiction] under [CIN / registration number].',
        '[State your SEBI registration category and number here, or state clearly that the entity is not SEBI registered and what that means for the client.]',
      ],
    },
    {
      heading: 'Suitability',
      body: [
        'The services described here may not be suitable for every person. Commit only capital you can afford to lose, and seek independent financial advice if you are unsure.',
      ],
    },
    {
      heading: 'Grievances',
      body: [
        'Complaints may be sent to [grievance officer name] at [grievance email], and will be acknowledged within [N] working days.',
      ],
    },
  ],
}

export const TERMS: LegalDoc = {
  title: 'Terms of service',
  updated: '[Date]',
  intro:
    'These terms govern your use of this site and any plan you purchase from [Entity legal name].',
  sections: [
    {
      heading: 'Who we are',
      body: [
        '[Entity legal name], registered at [registered address], [city], [state], [PIN]. Registration number [CIN]. Contact [support email].',
      ],
    },
    {
      heading: 'Eligibility',
      body: [
        'You must be at least 18 years old and legally able to enter a contract in your jurisdiction to purchase a plan.',
      ],
    },
    {
      heading: 'What a plan includes',
      body: [
        'Each plan sets out its own inclusions on the pricing page. [Describe precisely what the client receives, what is delivered by when, and what is excluded.]',
      ],
    },
    {
      heading: 'Payment',
      body: [
        'Plan fees are payable in advance in Indian Rupees. Prices shown [include / exclude] applicable GST at [rate].',
        'Payments are processed by [payment provider]. We do not store your card details.',
      ],
    },
    {
      heading: 'Client responsibilities',
      body: [
        'You are responsible for the accuracy of the information you give us and for any decision you take on the basis of our services.',
      ],
    },
    {
      heading: 'Limitation of liability',
      body: [
        '[To be drafted by counsel. Do not publish boilerplate here without review — limitation clauses are frequently unenforceable if drafted incorrectly.]',
      ],
    },
    {
      heading: 'Governing law',
      body: [
        'These terms are governed by the laws of India and subject to the exclusive jurisdiction of the courts at [city].',
      ],
    },
  ],
}

export const PRIVACY: LegalDoc = {
  title: 'Privacy policy',
  updated: '[Date]',
  intro:
    'This policy explains what personal data [Entity legal name] collects, why, and what rights you have over it.',
  sections: [
    {
      heading: 'What we collect',
      body: [
        'Details you submit through forms on this site: name, email address, phone number, and anything you write in a message field.',
        'Technical data your browser sends automatically, such as IP address and device information. [List any analytics or advertising tools in use, e.g. Google Analytics, Meta Pixel.]',
      ],
    },
    {
      heading: 'Why we use it',
      body: [
        'To respond to your enquiry, to deliver a plan you have purchased, and to meet our legal and accounting obligations.',
        '[If you send marketing messages, say so here and explain how to opt out.]',
      ],
    },
    {
      heading: 'Who we share it with',
      body: [
        '[List every processor: payment provider, email/CRM tool, hosting provider, analytics vendor.] We do not sell your personal data.',
      ],
    },
    {
      heading: 'How long we keep it',
      body: ['[State a retention period for each category of data.]'],
    },
    {
      heading: 'Your rights',
      body: [
        'Under the Digital Personal Data Protection Act, 2023, you may request access to, correction of, or erasure of your personal data, and you may withdraw consent at any time.',
        'To exercise these rights, contact our Data Protection Officer, [name], at [dpo email].',
      ],
    },
  ],
}

export const REFUNDS: LegalDoc = {
  title: 'Refund policy',
  updated: '[Date]',
  intro:
    'This policy sets out when a plan fee can be refunded and how long a refund takes.',
  sections: [
    {
      heading: 'Cancellation window',
      body: [
        'You may cancel within [N] days of purchase, provided [state the condition, e.g. the first session has not yet taken place], and receive a full refund.',
      ],
    },
    {
      heading: 'After a session has been delivered',
      body: [
        '[State clearly whether a partial refund applies once a session has been delivered, and how it is calculated.]',
      ],
    },
    {
      heading: 'Loss cover claims',
      body: [
        '[REVIEW REQUIRED] The pricing page advertises "100% Loss cover" on every plan. This section must define exactly what that covers, who funds it, what evidence a client has to provide, the claim deadline, and any cap. An undefined cover promise is a serious liability.',
      ],
    },
    {
      heading: 'How to request a refund',
      body: [
        'Email [refunds email] from the address used at purchase, with your order reference. Approved refunds are returned to the original payment method within [N] working days.',
      ],
    },
  ],
}

/* --------------------------------- contact -------------------------------- */

export const CONTACT = {
  email: '[support email]',
  phone: '[phone number]',
  hours: '[e.g. Mon–Sat, 10:00–19:00 IST]',
  address: '[registered address, city, state, PIN]',
}
