import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base, resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Github from "@lucide/svelte/icons/github";
import Moon from "@lucide/svelte/icons/moon";
import Sun from "@lucide/svelte/icons/sun";
import { toggleMode, mode } from "mode-watcher";
import LandingStatusDemo from "./LandingStatusDemo.svelte";

var root = $.from_html(`<meta name="description"/> <meta name="keywords" content="open source status page, docker status page, self-hosted status page, uptime monitor, incident management, status page tool, free status page, kener, status page docker compose, open source uptime monitoring"/> <link rel="icon"/> <link rel="canonical" href="https://kener.ing/docs"/> <meta property="og:type" content="website"/> <meta property="og:url" content="https://kener.ing/docs"/> <meta property="og:title"/> <meta property="og:description" content="Free, open-source status page you can self-host with Docker. Monitor 11 service types, manage incidents, schedule maintenance, and notify subscribers. Deploy in under 2 minutes with Docker Compose."/> <meta property="og:image" content="https://kener.ing/og.jpg"/> <meta property="og:image:width" content="1200"/> <meta property="og:image:height" content="630"/> <meta property="og:image:alt" content="Kener open source status page dashboard showing uptime monitoring and incident management"/> <meta property="og:site_name"/> <meta property="og:locale" content="en_US"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:title"/> <meta name="twitter:description" content="Free, self-hosted status page with Docker support. Monitor APIs, DNS, SSL, and more. Incident management, maintenance scheduling, and real-time notifications out of the box."/> <meta name="twitter:image" content="https://kener.ing/og.jpg"/> <!>`, 1);
var root_1 = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground hover:bg-foreground/5 hidden rounded-md px-3 py-1.5 text-[13px] font-medium tracking-tight transition-colors duration-300 sm:inline-flex"> </a>`);
var root_2 = $.from_html(`<a class="cta-pill-primary group svelte-1ppbv43" rel="external"><span class="text-sm font-semibold tracking-tight"> </span> <span class="cta-pill-icon svelte-1ppbv43"><!></span></a>`);
var root_3 = $.from_html(`<a class="cta-pill-secondary svelte-1ppbv43" rel="external"><span class="text-sm font-medium tracking-tight"> </span></a>`);
var root_4 = $.from_html(`<a class="row group svelte-1ppbv43"><span class="row-dot svelte-1ppbv43" aria-hidden="true"></span> <span class="row-title svelte-1ppbv43"> </span> <span class="row-desc svelte-1ppbv43"> </span> <span class="row-action svelte-1ppbv43">Docs <!></span></a>`);
var root_5 = $.from_html(`<div class="row svelte-1ppbv43"><span class="row-dot svelte-1ppbv43" aria-hidden="true"></span> <span class="row-title svelte-1ppbv43"> </span> <span class="row-desc svelte-1ppbv43"> </span> <span class="row-action svelte-1ppbv43"></span></div>`);
var root_6 = $.from_html(`<li><a class="text-muted-foreground hover:text-primary group flex items-center justify-between gap-3 border-b border-transparent py-1.5 text-sm transition-colors duration-300"><span> </span> <!></a></li>`);
var root_7 = $.from_html(`<div><h3 class="text-foreground text-sm font-semibold tracking-tight"> </h3> <ul class="mt-3 space-y-1"></ul></div>`);
var root_8 = $.from_html(`<td class="svelte-1ppbv43"> </td>`);
var root_9 = $.from_html(`<tr class="svelte-1ppbv43"><td class="cmp-feature svelte-1ppbv43"> </td><td class="cmp-kener svelte-1ppbv43"> </td><!></tr>`);
var root_10 = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground text-sm font-medium tracking-tight transition-colors duration-300"> </a>`);
var root_11 = $.from_html(`<div class="flex flex-wrap items-center gap-6"></div>`);

var root_12 = $.from_html(`<div class="docs-landing bg-background text-foreground min-h-screen svelte-1ppbv43"><header class="border-border/60 bg-background fixed top-0 right-0 left-0 z-40 border-b"><div class="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-5 md:px-8"><a class="text-foreground group flex items-center gap-2.5 no-underline"><img alt="" class="h-6 w-6 rounded-md"/> <span class="text-[15px] font-semibold tracking-tight"> </span></a> <div class="flex items-center gap-1"><!> <button aria-label="Toggle theme" class="text-muted-foreground hover:text-foreground hover:bg-foreground/5 inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-300"><!></button></div></div></header> <section class="px-5 pt-28 md:px-8 md:pt-36"><div class="mx-auto max-w-[1080px]"><div class="fade-up svelte-1ppbv43"><!></div> <h1 class="fade-up font-display text-foreground mt-14 text-4xl leading-[1.06] font-semibold tracking-tight text-balance md:mt-16 md:text-6xl md:text-wrap lg:text-[4.5rem] svelte-1ppbv43" style="animation-delay: 100ms">Open source status page <br class="hidden md:inline"/>you can <em class="svelte-1ppbv43">self-host</em></h1> <p class="fade-up text-muted-foreground mt-6 max-w-[62ch] text-base leading-[1.7] md:text-lg svelte-1ppbv43" style="animation-delay: 200ms">Kener is a free, open-source status page and uptime monitor. Deploy with Docker in under 2 minutes. Track 11
        service types, manage incidents, schedule maintenance, and notify subscribers, all from one platform.</p> <div class="fade-up mt-10 flex flex-wrap items-center gap-4 svelte-1ppbv43" style="animation-delay: 300ms"><!> <div class="flex items-center gap-3 sm:ml-auto"><a href="https://railway.com/deploy/spSvic?referralCode=1Pn7vs&amp;utm_medium=integration&amp;utm_source=template&amp;utm_campaign=generic" target="_blank" rel="noopener noreferrer" class="transition-transform duration-300 hover:scale-105"><img src="https://railway.com/button.svg" alt="Deploy on Railway" class="h-8"/></a> <a href="https://zeabur.com/templates/1YRTMI?referralCode=rajnandan1" target="_blank" rel="noopener noreferrer" class="transition-transform duration-300 hover:scale-105"><img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur" class="h-8"/></a></div></div> <div class="fade-up mt-20 svelte-1ppbv43" style="animation-delay: 400ms"><div class="shot-window svelte-1ppbv43"><div class="shot-bar svelte-1ppbv43"><span class="shot-dots svelte-1ppbv43" aria-hidden="true"><i class="svelte-1ppbv43"></i><i class="svelte-1ppbv43"></i><i class="svelte-1ppbv43"></i></span> <span class="shot-url svelte-1ppbv43">status.your-company.com</span></div> <img alt="Kener open source status page dashboard: uptime monitoring, incident management, and Docker deployment" class="bg-muted h-auto w-full object-cover dark:hidden" loading="eager" fetchpriority="high" decoding="async" width="2062" height="1146"/> <img alt="Kener open source status page dashboard: uptime monitoring, incident management, and Docker deployment" class="bg-muted hidden h-auto w-full object-cover dark:block" loading="eager" decoding="async" width="2056" height="1138"/></div></div></div></section> <section class="px-5 pt-24 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="rail svelte-1ppbv43"><h2 class="rail-title svelte-1ppbv43">Status page monitoring features</h2> <span class="rail-rule svelte-1ppbv43" aria-hidden="true"></span> <span class="rail-meta svelte-1ppbv43"><span class="rail-meta-dot svelte-1ppbv43" aria-hidden="true"></span>12 / 12 operational</span></div> <p class="text-muted-foreground mt-4 max-w-[65ch] text-sm leading-[1.7]">From uptime monitoring to incident management: everything you need to run a production status page.</p> <div class="rows mt-10 svelte-1ppbv43"></div></div></section> <section class="px-5 pt-24 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="rail svelte-1ppbv43"><h2 class="rail-title svelte-1ppbv43">Advanced ops &amp; admin tools</h2> <span class="rail-rule svelte-1ppbv43" aria-hidden="true"></span> <span class="rail-meta svelte-1ppbv43">admin</span></div> <p class="text-muted-foreground mt-4 max-w-[65ch] text-sm leading-[1.7]">Self-hosted status page with deep operational tooling: secrets vault, triggers, API keys, and analytics.</p> <div class="rows mt-10 svelte-1ppbv43"></div></div></section> <section class="px-5 pt-24 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="rail svelte-1ppbv43"><h2 class="rail-title svelte-1ppbv43">Kener documentation</h2> <span class="rail-rule svelte-1ppbv43" aria-hidden="true"></span> <span class="rail-meta svelte-1ppbv43">guides &amp; reference</span></div> <p class="text-muted-foreground mt-4 max-w-[65ch] text-sm leading-[1.7]">Guides for Docker deployment, monitor configuration, incident workflows, and API integration.</p> <div class="mt-10 grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"></div></div></section> <section class="px-5 pt-24 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="rail svelte-1ppbv43"><h2 class="rail-title svelte-1ppbv43">How Kener compares</h2> <span class="rail-rule svelte-1ppbv43" aria-hidden="true"></span> <span class="rail-meta svelte-1ppbv43">4 tools</span></div> <p class="text-muted-foreground mt-4 max-w-[65ch] text-sm leading-[1.7]">See how Kener stacks up against popular open-source and SaaS status page tools.</p> <div class="mt-10 overflow-x-auto"><table class="cmp-table w-full text-sm svelte-1ppbv43"><thead><tr><th class="cmp-feature svelte-1ppbv43">Feature</th><th class="cmp-kener svelte-1ppbv43">Kener</th><th class="svelte-1ppbv43">Upptime</th><th class="svelte-1ppbv43">Uptime Kuma</th><th class="svelte-1ppbv43">Statuspage</th></tr></thead><tbody class="svelte-1ppbv43"></tbody></table></div> <div class="mt-10"><a class="cta-pill-secondary group inline-flex svelte-1ppbv43"><span class="text-sm font-medium tracking-tight">View full comparison</span> <!></a></div></div></section> <section class="px-5 pt-24 pb-8 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="gh-panel md:flex md:items-center md:justify-between md:gap-10 svelte-1ppbv43"><div><h2 class="text-foreground text-xl font-semibold tracking-tight">Star Kener on GitHub</h2> <p class="text-muted-foreground mt-2 max-w-[58ch] text-sm leading-[1.65]">Join the open-source community. Contribute features, report issues, and help build the best free status page
            platform.</p></div> <a href="https://github.com/rajnandan1/kener" target="_blank" rel="noopener noreferrer" class="cta-github-pill group mt-6 shrink-0 md:mt-0 svelte-1ppbv43"><!> <span class="text-sm font-semibold tracking-tight">Star on GitHub</span> <span class="cta-github-icon svelte-1ppbv43"><!></span></a></div></div></section> <footer class="border-border/60 mt-16 border-t px-5 py-10 md:px-8"><div class="mx-auto flex max-w-[1080px] flex-col items-start justify-between gap-4 md:flex-row md:items-center"><p class="text-muted-foreground text-sm tracking-tight">Free and open source, MIT licensed.</p> <!></div></footer></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	function flattenPages(pages) {
		return pages.flatMap((page) => [page, ...page.pages ? flattenPages(page.pages) : []]);
	}

	function getAllPages() {
		return $$props.data.config.sidebar.flatMap((group) => flattenPages(group.pages));
	}

	function findFirstSlug(candidates) {
		const match = getAllPages().find((page) => {
			if (candidates.includes(page.slug)) return true;

			const unprefixed = $$props.data.config.activeVersion && page.slug.startsWith(`${$$props.data.config.activeVersion}/`)
				? page.slug.slice($$props.data.config.activeVersion.length + 1)
				: page.slug;

			return candidates.includes(unprefixed);
		});

		return match?.slug;
	}

	function getQuickStartSlug() {
		return findFirstSlug(["quickstart", "introduction"]) ?? $$props.data.config.sidebar[0]?.pages[0]?.slug;
	}

	const coreFeatures = [
		{
			title: "11 Monitor Types",
			description: "Track API, Ping, TCP, DNS, SSL, SQL, Heartbeat, GameDig, and gRPC services with configurable check intervals and thresholds.",
			href: "/docs/monitors/overview"
		},

		{
			title: "Incident Management",
			description: "Create transparent incident timelines with updates, acknowledgements, and clear communication.",
			href: "/docs/incidents/overview"
		},

		{
			title: "Smart Notifications",
			description: "Notify subscribers via email, webhooks, Slack, and Discord with trigger-based workflows.",
			href: "/docs/alerting/overview"
		},

		{
			title: "Maintenance Scheduling",
			description: "Plan recurring maintenance windows and keep customers informed before, during, and after.",
			href: "/docs/maintenances/overview"
		},

		{
			title: "Multi-user Collaboration",
			description: "Invite your team with role-based access to monitors, incidents, and configuration workflows.",
			href: "/docs/user-management"
		},

		{
			title: "Multi-page Status Dashboard",
			description: "Run multiple branded status pages from a single self-hosted Kener instance: one per product, team, or region.",
			href: "/docs/pages"
		},

		{
			title: "Complete API Access",
			description: "Automate incidents, monitor operations, and reporting with the full REST API.",
			href: "/docs/spec/v4/"
		},

		{
			title: "21 Languages & i18n",
			description: "Built-in localization with 21 languages, timezone-aware display, and SEO-friendly pages for global audiences.",
			href: "/docs/internationalization"
		},

		{
			title: "Customization & Branding",
			description: "Customize logo, colors, CSS, and theme behavior to match your product identity.",
			href: "/docs/setup/customizations"
		},

		{
			title: "Dark Mode Ready",
			description: "Built-in theme switching and excellent readability in both light and dark environments."
		},

		{
			title: "Embeddable Widgets & Badges",
			description: "Embed status cards and badges into your website, app, or support portal.",
			href: "/docs/sharing"
		},

		{
			title: "Analytics Ready",
			description: "Connect external analytics providers and understand how users interact with status updates."
		}
	];

	const advancedFeatures = [
		{
			title: "Vault & Secret Management",
			description: "Securely store sensitive keys and credentials for integrations and monitor workflows."
		},

		{
			title: "Monitoring Data Explorer",
			description: "Inspect historical checks, drill into failures, and analyze uptime trends from one place."
		},

		{
			title: "Trigger System",
			description: "Create smart trigger conditions to route alerts and automate operational notifications."
		},

		{
			title: "Template-driven Messaging",
			description: "Standardize incident and notification communication with reusable templates."
		},

		{
			title: "API Key Management",
			description: "Issue and revoke API keys for secure automation and third-party integrations."
		},

		{
			title: "Analytics Provider Integrations",
			description: "Plug in providers like GA, Plausible, Mixpanel, Umami, Clarity, and more."
		}
	];

	function getGroupHighlights() {
		return $$props.data.config.sidebar.slice(0, 6).map((group) => ({
			group: group.group,
			pages: flattenPages(group.pages).slice(0, 3)
		}));
	}

	function getCtaButtons() {
		const quickStartSlug = getQuickStartSlug();

		return [
			{
				title: "Get Started",
				href: quickStartSlug ? `/docs/${quickStartSlug}` : "/docs",
				primary: true
			},

			{
				title: "API Reference",
				href: "/docs/spec/v4/",
				primary: false
			}
		];
	}

	function getHref(path) {
		if (!path.startsWith("/docs") || !$$props.data.config.activeVersion) {
			return `${base}${path}`;
		}

		if (path.startsWith("/docs/spec/")) {
			return `${base}${path}`;
		}

		const suffix = path.replace(/^\/docs\/?/, "");

		if (suffix.startsWith(`${$$props.data.config.activeVersion}/`)) {
			return `${base}/docs/${suffix}`;
		}

		const versionedPath = suffix
			? `/docs/${$$props.data.config.activeVersion}/${suffix}`
			: `/docs/${$$props.data.config.activeVersion}`;

		return `${base}${versionedPath}`;
	}

	const comparisonRows = [
		{
			feature: "Self-hosted",
			kener: "Yes",
			others: ["GitHub only", "Yes", "No"]
		},

		{
			feature: "Monitor types",
			kener: "11",
			others: ["1", "10+", "External"]
		},

		{
			feature: "Incident management",
			kener: "Full lifecycle",
			others: ["GitHub Issues", "No", "Yes"]
		},

		{
			feature: "Recurring maintenance",
			kener: "RRULE",
			others: ["Basic", "Basic", "Basic"]
		},

		{
			feature: "Subscriber notifications",
			kener: "Unlimited",
			others: ["No", "No", "Capped"]
		},

		{
			feature: "RBAC",
			kener: "3 roles",
			others: ["No", "No", "Paid tiers"]
		},

		{
			feature: "REST API",
			kener: "17+ endpoints",
			others: ["Read-only", "Yes", "Yes"]
		},

		{
			feature: "Cost",
			kener: "Free",
			others: ["Free", "Free", "$29–1,499/mo"]
		}
	];

	var div = root_12();

	$.head('1ppbv43', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var link_1 = $.sibling(meta, 4);
		var meta_1 = $.sibling(link_1, 8);
		var meta_2 = $.sibling(meta_1, 12);
		var meta_3 = $.sibling(meta_2, 6);
		var node = $.sibling(meta_3, 6);

		$.html(node, () => `<script type="application/ld+json">${JSON.stringify([
			{
				"@context": "https://schema.org",
				"@type": "SoftwareApplication",
				name: "Kener",
				applicationCategory: "DeveloperApplication",
				operatingSystem: "Linux, macOS, Windows, Docker",
				description: "Kener is a free, open-source status page system and uptime monitor. Self-host with Docker or deploy to Railway and Zeabur. Supports 11 monitor types including API, Ping, TCP, DNS, SSL, SQL, gRPC, and more.",
				url: "https://kener.ing",
				downloadUrl: "https://github.com/rajnandan1/kener",
				softwareVersion: "latest",
				license: "https://opensource.org/licenses/MIT",
				offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
				author: {
					"@type": "Person",
					name: "Raj Nandan Sharma",
					url: "https://github.com/rajnandan1"
				},
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: "5",
					ratingCount: "1",
					bestRating: "5"
				},
				featureList: "Uptime Monitoring, Incident Management, Maintenance Scheduling, Status Page, Docker Deployment, REST API, Email Notifications, Slack Integration, Discord Integration, Webhook Alerts, Embeddable Widgets, Multi-language Support, Dark Mode"
			},

			{
				"@context": "https://schema.org",
				"@type": "FAQPage",
				mainEntity: [
					{
						"@type": "Question",
						name: "What is Kener?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Kener is a free, open-source status page system built with SvelteKit and Node.js. It provides real-time uptime monitoring across 11 service types, incident management, maintenance scheduling, and customizable dashboards. You can self-host it with Docker in under 2 minutes, or one-click deploy to Railway and Zeabur."
						}
					},

					{
						"@type": "Question",
						name: "How do I deploy Kener with Docker?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Kener can be deployed with a single docker-compose.yml file. Run 'docker compose up -d' to start. It supports SQLite (default), PostgreSQL, and MySQL databases. You need Redis for the job queue. One-click deploy options are also available for Railway and Zeabur."
						}
					},

					{
						"@type": "Question",
						name: "What types of monitors does Kener support?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Kener supports 11 monitor types: API (HTTP), Ping, TCP, DNS, SSL certificate, SQL database, Heartbeat, GameDig (game server), gRPC, Group, and None. Each monitor type can be configured with custom check intervals, thresholds, and alerting rules."
						}
					},

					{
						"@type": "Question",
						name: "Is Kener a good alternative to Statuspage, Betteruptime, or Upptime?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Yes. Kener is a free, MIT-licensed, open-source alternative to paid status page services like Atlassian Statuspage, Better Uptime, and Instatus. Unlike SaaS options, Kener gives you full control over your data with self-hosted Docker deployment, supports 11 monitor types, 21 languages, and includes incident management, maintenance scheduling, and subscriber notifications at no cost."
						}
					},

					{
						"@type": "Question",
						name: "Does Kener support incident management?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Yes, Kener has full incident management with transparent timelines, status updates, acknowledgements, and clear communication workflows. You can create, update, and resolve incidents through the admin dashboard or the REST API."
						}
					},

					{
						"@type": "Question",
						name: "Can I customize the look and feel of my Kener status page?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Yes, Kener offers extensive customization including custom logos, colors, CSS, theme behavior (light/dark mode), localization across 21 languages, and multiple branded status pages from a single instance. It also supports embeddable status widgets and uptime badges."
						}
					},

					{
						"@type": "Question",
						name: "Does Kener have an API?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Yes, Kener provides a complete REST API (v4) for automating incidents, monitor operations, and reporting. API access is secured with Bearer token authentication and supports full CRUD operations."
						}
					},

					{
						"@type": "Question",
						name: "What notification channels does Kener support?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Kener supports notifications via email, webhooks, Slack, and Discord. It uses a trigger-based workflow system where you can configure smart conditions to route alerts and automate operational notifications to your team."
						}
					},

					{
						"@type": "Question",
						name: "Is Kener free and open source?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Yes, Kener is 100% free and open-source, licensed under the MIT license. The source code is available on GitHub at github.com/rajnandan1/kener. There are no paid tiers or premium features — every feature is available to all users."
						}
					}
				]
			}
		])}</script>`);

		$.template_effect(
			($0) => {
				$.set_attribute(meta, 'content', `${$$props.data.config.name ?? ''} is a free, open-source status page system you can self-host with Docker. Monitor APIs, Ping, TCP, DNS, SSL, and SQL services. Features incident management, maintenance scheduling, real-time notifications, embeddable widgets, and a REST API. Supports 11 monitor types, 21 languages, and deploys in under 2 minutes.`);
				$.set_attribute(link_1, 'href', $0);
				$.set_attribute(meta_1, 'content', `${$$props.data.config.name ?? ''} - Open Source Status Page | Self-Hosted with Docker`);
				$.set_attribute(meta_2, 'content', $$props.data.config.name);
				$.set_attribute(meta_3, 'content', `${$$props.data.config.name ?? ''} - Open Source Status Page & Docker Uptime Monitor`);
			},
			[
				() => $$props.data.config.favicon
					? clientResolver(resolve, $$props.data.config.favicon)
					: $$props.data.config.favicon
			]
		);

		$.deferred_template_effect(() => {
			$.document.title = `${$$props.data.config.name ?? ''} - Open Source Status Page | Self-Hosted Docker Status Page & Uptime Monitor`;
		});

		$.append($$anchor, fragment);
	});

	var header = $.child(div);
	var div_1 = $.child(header);
	var a = $.child(div_1);
	var img = $.child(a);
	var span = $.sibling(img, 2);
	var text = $.only_child(span, true);

	$.reset(a);

	var div_2 = $.sibling(a, 2);
	var node_1 = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 17, () => $$props.data.config.footerLinks.slice(0, 3), (link) => link.url, ($$anchor, link) => {
				var a_1 = root_1();
				var text_1 = $.only_child(a_1, true);

				$.template_effect(() => {
					$.set_attribute(a_1, 'href', $.get(link).url);
					$.set_text(text_1, $.get(link).name);
				});

				$.append($$anchor, a_1);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.data.config.footerLinks) $$render(consequent);
		});
	}

	var button_1 = $.sibling(node_1, 2);
	var node_3 = $.child(button_1);

	{
		var consequent_1 = ($$anchor) => {
			Sun($$anchor, { class: 'h-4 w-4' });
		};

		var alternate = ($$anchor) => {
			Moon($$anchor, { class: 'h-4 w-4' });
		};

		$.if(node_3, ($$render) => {
			if (mode.current === "dark") $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(header);

	var section = $.sibling(header, 2);
	var div_3 = $.child(section);
	var div_4 = $.child(div_3);
	var node_4 = $.child(div_4);

	LandingStatusDemo(node_4, {});
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 6);
	var node_5 = $.child(div_5);

	$.each(node_5, 17, getCtaButtons, (button) => button.title, ($$anchor, button) => {
		var fragment_4 = $.comment();
		var node_6 = $.first_child(fragment_4);

		{
			var consequent_2 = ($$anchor) => {
				var a_2 = root_2();
				var span_1 = $.child(a_2);
				var text_2 = $.only_child(span_1, true);
				var span_2 = $.sibling(span_1, 2);
				var node_7 = $.child(span_2);

				ArrowRight(node_7, {
					class: 'h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-px'
				});

				$.reset(span_2);
				$.reset(a_2);

				$.template_effect(
					($0) => {
						$.set_attribute(a_2, 'href', $0);
						$.set_text(text_2, $.get(button).title);
					},
					[() => getHref($.get(button).href)]
				);

				$.append($$anchor, a_2);
			};

			var alternate_1 = ($$anchor) => {
				var a_3 = root_3();
				var span_3 = $.child(a_3);
				var text_3 = $.only_child(span_3, true);

				$.reset(a_3);

				$.template_effect(
					($0) => {
						$.set_attribute(a_3, 'href', $0);
						$.set_text(text_3, $.get(button).title);
					},
					[() => getHref($.get(button).href)]
				);

				$.append($$anchor, a_3);
			};

			$.if(node_6, ($$render) => {
				if ($.get(button).primary) $$render(consequent_2); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment_4);
	});

	$.next(2);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.child(div_6);
	var img_1 = $.sibling($.child(div_7), 2);
	var img_2 = $.sibling(img_1, 2);

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div_3);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_8 = $.child(section_1);
	var div_9 = $.sibling($.child(div_8), 4);

	$.each(div_9, 21, () => coreFeatures, (feature) => feature.title, ($$anchor, feature) => {
		var fragment_5 = $.comment();
		var node_8 = $.first_child(fragment_5);

		{
			var consequent_3 = ($$anchor) => {
				var a_4 = root_4();
				var span_4 = $.sibling($.child(a_4), 2);
				var text_4 = $.only_child(span_4, true);
				var span_5 = $.sibling(span_4, 2);
				var text_5 = $.only_child(span_5, true);
				var span_6 = $.sibling(span_5, 2);
				var node_9 = $.sibling($.child(span_6));

				ArrowRight(node_9, {
					class: 'h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5'
				});

				$.reset(span_6);
				$.reset(a_4);

				$.template_effect(
					($0) => {
						$.set_attribute(a_4, 'href', $0);
						$.set_text(text_4, $.get(feature).title);
						$.set_text(text_5, $.get(feature).description);
					},
					[() => getHref($.get(feature).href)]
				);

				$.append($$anchor, a_4);
			};

			var alternate_2 = ($$anchor) => {
				var div_10 = root_5();
				var span_7 = $.sibling($.child(div_10), 2);
				var text_6 = $.only_child(span_7, true);
				var span_8 = $.sibling(span_7, 2);
				var text_7 = $.only_child(span_8, true);

				$.next(2);
				$.reset(div_10);

				$.template_effect(() => {
					$.set_text(text_6, $.get(feature).title);
					$.set_text(text_7, $.get(feature).description);
				});

				$.append($$anchor, div_10);
			};

			$.if(node_8, ($$render) => {
				if ($.get(feature).href) $$render(consequent_3); else $$render(alternate_2, -1);
			});
		}

		$.append($$anchor, fragment_5);
	});

	$.reset(div_9);
	$.reset(div_8);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_11 = $.child(section_2);
	var div_12 = $.sibling($.child(div_11), 4);

	$.each(div_12, 21, () => advancedFeatures, (feature) => feature.title, ($$anchor, feature) => {
		var div_13 = root_5();
		var span_9 = $.sibling($.child(div_13), 2);
		var text_8 = $.only_child(span_9, true);
		var span_10 = $.sibling(span_9, 2);
		var text_9 = $.only_child(span_10, true);

		$.next(2);
		$.reset(div_13);

		$.template_effect(() => {
			$.set_text(text_8, $.get(feature).title);
			$.set_text(text_9, $.get(feature).description);
		});

		$.append($$anchor, div_13);
	});

	$.reset(div_12);
	$.reset(div_11);
	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var div_14 = $.child(section_3);
	var div_15 = $.sibling($.child(div_14), 4);

	$.each(div_15, 21, getGroupHighlights, (group) => group.group, ($$anchor, group) => {
		var div_16 = root_7();
		var h3 = $.child(div_16);
		var text_10 = $.only_child(h3, true);
		var ul = $.sibling(h3, 2);

		$.each(ul, 21, () => $.get(group).pages, (page) => page.slug, ($$anchor, page) => {
			var li = root_6();
			var a_5 = $.child(li);
			var span_11 = $.child(a_5);
			var text_11 = $.only_child(span_11, true);
			var node_10 = $.sibling(span_11, 2);

			ArrowRight(node_10, {
				class: 'h-3.5 w-3.5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-60'
			});

			$.reset(a_5);
			$.reset(li);

			$.template_effect(
				($0) => {
					$.set_attribute(a_5, 'href', $0);
					$.set_text(text_11, $.get(page).title);
				},
				[() => getHref(`/docs/${$.get(page).slug}`)]
			);

			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_16);
		$.template_effect(() => $.set_text(text_10, $.get(group).group));
		$.append($$anchor, div_16);
	});

	$.reset(div_15);
	$.reset(div_14);
	$.reset(section_3);

	var section_4 = $.sibling(section_3, 2);
	var div_17 = $.child(section_4);
	var div_18 = $.sibling($.child(div_17), 4);
	var table = $.child(div_18);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => comparisonRows, (row) => row.feature, ($$anchor, row) => {
		var tr = root_9();
		var td = $.child(tr);
		var text_12 = $.only_child(td, true);
		var td_1 = $.sibling(td);
		var text_13 = $.only_child(td_1, true);
		var node_11 = $.sibling(td_1);

		$.each(node_11, 17, () => $.get(row).others, $.index, ($$anchor, value) => {
			var td_2 = root_8();
			var text_14 = $.only_child(td_2, true);

			$.template_effect(() => $.set_text(text_14, $.get(value)));
			$.append($$anchor, td_2);
		});

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_12, $.get(row).feature);
			$.set_text(text_13, $.get(row).kener);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var a_6 = $.child(div_19);
	var node_12 = $.sibling($.child(a_6), 2);

	ArrowRight(node_12, {
		class: 'h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5'
	});

	$.reset(a_6);
	$.reset(div_19);
	$.reset(div_17);
	$.reset(section_4);

	var section_5 = $.sibling(section_4, 2);
	var div_20 = $.child(section_5);
	var div_21 = $.child(div_20);
	var a_7 = $.sibling($.child(div_21), 2);
	var node_13 = $.child(a_7);

	Github(node_13, { class: 'h-4 w-4' });

	var span_12 = $.sibling(node_13, 4);
	var node_14 = $.child(span_12);

	ArrowRight(node_14, {
		class: 'h-3 w-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-px'
	});

	$.reset(span_12);
	$.reset(a_7);
	$.reset(div_21);
	$.reset(div_20);
	$.reset(section_5);

	var footer = $.sibling(section_5, 2);
	var div_22 = $.child(footer);
	var node_15 = $.sibling($.child(div_22), 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_23 = root_11();

			$.each(div_23, 21, () => $$props.data.config.footerLinks, (link) => link.url, ($$anchor, link) => {
				var a_8 = root_10();
				var text_15 = $.only_child(a_8, true);

				$.template_effect(() => {
					$.set_attribute(a_8, 'href', $.get(link).url);
					$.set_text(text_15, $.get(link).name);
				});

				$.append($$anchor, a_8);
			});

			$.reset(div_23);
			$.append($$anchor, div_23);
		};

		$.if(node_15, ($$render) => {
			if ($$props.data.config.footerLinks) $$render(consequent_4);
		});
	}

	$.reset(div_22);
	$.reset(footer);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(img, 'src', `${base ?? ''}/logo96.png`);
			$.set_text(text, $$props.data.config.name);
			$.set_attribute(img_1, 'src', `${base ?? ''}/xt_white.webp`);
			$.set_attribute(img_2, 'src', `${base ?? ''}/xt_black.webp`);
			$.set_attribute(a_6, 'href', $1);
		},
		[
			() => getHref("/docs"),
			() => getHref("/docs/guides/comparison")
		]
	);

	$.delegated('click', button_1, function (...$$args) {
		toggleMode?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);