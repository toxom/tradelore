import { Moon, Sun, Sunset, Sunrise, Focus, Bold, Gauge } from 'lucide-svelte';

export default {
	nav: {
		ask: 'Ask',
		build: 'Build',
		notes: 'Notes',
		features: 'Features',
		pricing: 'Pricing',
		blog: 'Blog',
		help: 'Help',
		docs: 'Docs',
		themes: 'Switch themes',
        notifications: 'Notifications',
		login: 'Login',
		signup: 'Sign Up',
		wallet: 'Wallet',
		trade: 'Trade',
	},
	lang: {
		notification: 'Language: English',
		flag: '🇬🇧',
        abbreviation: 'EN'
	},
	footer: {
		rights: 'All Rights Reserved.',
        about: {
            title: 'About',
            whyMagellan: 'Why Magellan?',
            howItWorks: 'How It Works',
            knowledgeBase: 'Knowledge Base',
            transparency: 'Transparency',
            fees: 'Fees'
        },
        services: {
            title: 'Services',
            spotTrading: 'Spot Trading',
            marginTrading: 'Margin Trading',
            futuresTrading: 'Futures Trading',
            stakingLending: 'Staking & Lending',
            portfolioTools: 'Portfolio Management Tools',
            tradingBots: 'Automated Trading Bots',
            apiAccess: 'API Access',
            educationalResources: 'Educational Resources',
            securityCustody: 'Security & Custody'
        },
        solutions: {
            title: 'Solutions',
            individuals: 'For Individuals',
            merchants: 'For Merchants',
            exchanges: 'For Exchanges'
        }
    },
	tooltip: {
		newProject: 'Create project',
		newThread: 'Create discussion',
		findThread: 'Find discussion'
	},
	landing: {
		title: 'Track. Plan. Grow.',
		hero: 'From Dividends to Rebalancing, We\'ve Got You Covered.',
		catalog: 'Access a diverse range of thousands of stocks, funds, bonds, and cryptocurrencies worldwide.',
		cta: 'Ready to begin your trading journey?',
		learn: 'Select any window below to start learning',
		subscribing: 'Subscribe',
		usercount: 'users',
		introText:
			"vRazum makes collaborating fun and seamless, whether you're brainstorming with friends or building a global community. Customize your space to chat, create, and work together in real time.",
		textplaceholder: "What's on your mind?",
		features: {
			feature1: {
				heading: '5 brokers',
				description: 'Connect with 5 leading brokers for diverse trading options and seamless execution.'
			},
			feature2: {
				heading: '+100 cryptocurrencies',
				description: 'Access over 100 cryptocurrencies, from established giants to emerging altcoins, for a wide range of investment opportunities.'
			},
			feature3: {
				heading: 'Fast swaps',
				description: 'Experience lightning-fast cryptocurrency swaps, minimizing delays and maximizing your trading efficiency.'
			}
		},
		join: 'Join for free',
		join2: "It takes only few minutes.",
	},
	pricing: {
		title: 'Pricing',
		plans: [
			{
				name: 'Basic',
				price: 'Free',
				features: ['Up to 3000 tokens per day', 'Basic AI features']
			},
			{
				name: 'Pro',
				price: '$14.99/month',
				features: ['Access to multi-agent tools', '50GB storage']
			},
			{
				name: 'Enterprise',
				price: 'Contact us',
				features: ['Unlimited users', 'Custom AI solutions', 'Unlimited storage']
			}
		]
	},
	ui: {
		styles: [
			{
				name: 'Light',
				value: 'default',
				icon: Sun,
				description: 'This style will brighten your day',
				dummyContent: 'Sunshine and clear skies'
			},
			{
				name: 'Dark',
				value: 'dark',
				icon: Moon,
				description: 'For night owls and stargazers',
				dummyContent: 'Moonlit adventures await'
			}
		]
	},
	dashboard: {
		title: 'Dashboard',
		nameThreads: 'total threads',
		nameMessages: 'total messages',
		nameTags: 'tags',
		nameTimer: 'time spent',
		nameActive: 'Last Active:'
	},
	dates: {
		today: 'Today',
		yesterday: 'Yesterday',
		lastweek: 'Last Week',
		thismonth: 'This Month',
		older: 'Older',
		updated: 'Updated'
	},
	profile: {
		name: 'Name:',
		email: 'Email:',
		role: 'Role:',
		created: 'Created:',
		updated: 'Updated:',
		verified: 'Verified:',
		edit: 'Edit',
		save: 'Save',
		close: 'Cancel',
		logout: 'Log Out',
		login: 'Log In',
		signup: 'Sign Up',
		clause: 'By using vRazum you automatically agree to our',
		terms: 'Terms',
		privacy: 'Privacy',
		waitlist: 'Join the Waitlist',
		join: 'Subscribe'
	},
};
