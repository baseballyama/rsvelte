import * as $ from 'svelte/internal/server';
import { base, resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Github from "@lucide/svelte/icons/github";
import Moon from "@lucide/svelte/icons/moon";
import Sun from "@lucide/svelte/icons/sun";
import { toggleMode, mode } from "mode-watcher";
import LandingStatusDemo from "./LandingStatusDemo.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		function flattenPages(pages) {
			return pages.flatMap((page) => [page, ...page.pages ? flattenPages(page.pages) : []]);
		}

		function getAllPages() {
			return data.config.sidebar.flatMap((group) => flattenPages(group.pages));
		}

		function findFirstSlug(candidates) {
			const match = getAllPages().find((page) => {
				if (candidates.includes(page.slug)) return true;

				const unprefixed = data.config.activeVersion && page.slug.startsWith(`${data.config.activeVersion}/`)
					? page.slug.slice(data.config.activeVersion.length + 1)
					: page.slug;

				return candidates.includes(unprefixed);
			});

			return match?.slug;
		}

		function getQuickStartSlug() {
			return findFirstSlug(["quickstart", "introduction"]) ?? data.config.sidebar[0]?.pages[0]?.slug;
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
			return data.config.sidebar.slice(0, 6).map((group) => ({
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
			if (!path.startsWith("/docs") || !data.config.activeVersion) {
				return `${base}${path}`;
			}

			if (path.startsWith("/docs/spec/")) {
				return `${base}${path}`;
			}

			const suffix = path.replace(/^\/docs\/?/, "");

			if (suffix.startsWith(`${data.config.activeVersion}/`)) {
				return `${base}/docs/${suffix}`;
			}

			const versionedPath = suffix
				? `/docs/${data.config.activeVersion}/${suffix}`
				: `/docs/${data.config.activeVersion}`;

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

		$.head('1ppbv43', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(data.config.name)} - Open Source Status Page | Self-Hosted Docker Status Page &amp; Uptime Monitor</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', `${$.stringify(data.config.name)} is a free, open-source status page system you can self-host with Docker. Monitor APIs, Ping, TCP, DNS, SSL, and SQL services. Features incident management, maintenance scheduling, real-time notifications, embeddable widgets, and a REST API. Supports 11 monitor types, 21 languages, and deploys in under 2 minutes.`)}/> <meta name="keywords" content="open source status page, docker status page, self-hosted status page, uptime monitor, incident management, status page tool, free status page, kener, status page docker compose, open source uptime monitoring"/> <link rel="icon"${$.attr('href', data.config.favicon
				? clientResolver(resolve, data.config.favicon)
				: data.config.favicon)}/> <link rel="canonical" href="https://kener.ing/docs"/> <meta property="og:type" content="website"/> <meta property="og:url" content="https://kener.ing/docs"/> <meta property="og:title"${$.attr('content', `${$.stringify(data.config.name)} - Open Source Status Page | Self-Hosted with Docker`)}/> <meta property="og:description" content="Free, open-source status page you can self-host with Docker. Monitor 11 service types, manage incidents, schedule maintenance, and notify subscribers. Deploy in under 2 minutes with Docker Compose."/> <meta property="og:image" content="https://kener.ing/og.jpg"/> <meta property="og:image:width" content="1200"/> <meta property="og:image:height" content="630"/> <meta property="og:image:alt" content="Kener open source status page dashboard showing uptime monitoring and incident management"/> <meta property="og:site_name"${$.attr('content', data.config.name)}/> <meta property="og:locale" content="en_US"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:title"${$.attr('content', `${$.stringify(data.config.name)} - Open Source Status Page & Docker Uptime Monitor`)}/> <meta name="twitter:description" content="Free, self-hosted status page with Docker support. Monitor APIs, DNS, SSL, and more. Incident management, maintenance scheduling, and real-time notifications out of the box."/> <meta name="twitter:image" content="https://kener.ing/og.jpg"/> ${$.html(`<script type="application/ld+json">${JSON.stringify([
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
			])}</script>`)}`);
		});

		$$renderer.push(`<div class="docs-landing bg-background text-foreground min-h-screen svelte-1ppbv43"><header class="border-border/60 bg-background fixed top-0 right-0 left-0 z-40 border-b"><div class="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-5 md:px-8"><a${$.attr('href', getHref("/docs"))} class="text-foreground group flex items-center gap-2.5 no-underline"><img${$.attr('src', `${$.stringify(base)}/logo96.png`)} alt="" class="h-6 w-6 rounded-md"/> <span class="text-[15px] font-semibold tracking-tight">${$.escape(data.config.name)}</span></a> <div class="flex items-center gap-1">`);

		if (data.config.footerLinks) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(data.config.footerLinks.slice(0, 3));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let link = each_array[$$index];

				$$renderer.push(`<a${$.attr('href', link.url)} target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground hover:bg-foreground/5 hidden rounded-md px-3 py-1.5 text-[13px] font-medium tracking-tight transition-colors duration-300 sm:inline-flex">${$.escape(link.name)}</a>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button aria-label="Toggle theme" class="text-muted-foreground hover:text-foreground hover:bg-foreground/5 inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-300">`);

		if (mode.current === "dark") {
			$$renderer.push('<!--[0-->');
			Sun($$renderer, { class: 'h-4 w-4' });
		} else {
			$$renderer.push('<!--[-1-->');
			Moon($$renderer, { class: 'h-4 w-4' });
		}

		$$renderer.push(`<!--]--></button></div></div></header> <section class="px-5 pt-28 md:px-8 md:pt-36"><div class="mx-auto max-w-[1080px]"><div class="fade-up svelte-1ppbv43">`);
		LandingStatusDemo($$renderer, {});

		$$renderer.push(`<!----></div> <h1 class="fade-up font-display text-foreground mt-14 text-4xl leading-[1.06] font-semibold tracking-tight text-balance md:mt-16 md:text-6xl md:text-wrap lg:text-[4.5rem] svelte-1ppbv43" style="animation-delay: 100ms">Open source status page <br class="hidden md:inline"/>you can <em class="svelte-1ppbv43">self-host</em></h1> <p class="fade-up text-muted-foreground mt-6 max-w-[62ch] text-base leading-[1.7] md:text-lg svelte-1ppbv43" style="animation-delay: 200ms">Kener is a free, open-source status page and uptime monitor. Deploy with Docker in under 2 minutes. Track 11
        service types, manage incidents, schedule maintenance, and notify subscribers, all from one platform.</p> <div class="fade-up mt-10 flex flex-wrap items-center gap-4 svelte-1ppbv43" style="animation-delay: 300ms"><!--[-->`);

		const each_array_1 = $.ensure_array_like(getCtaButtons());

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let button = each_array_1[$$index_1];

			if (button.primary) {
				$$renderer.push(`<!--[0--><a${$.attr('href', getHref(button.href))} class="cta-pill-primary group svelte-1ppbv43" rel="external"><span class="text-sm font-semibold tracking-tight">${$.escape(button.title)}</span> <span class="cta-pill-icon svelte-1ppbv43">`);

				ArrowRight($$renderer, {
					class: 'h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-px'
				});

				$$renderer.push(`<!----></span></a>`);
			} else {
				$$renderer.push(`<!--[-1--><a${$.attr('href', getHref(button.href))} class="cta-pill-secondary svelte-1ppbv43" rel="external"><span class="text-sm font-medium tracking-tight">${$.escape(button.title)}</span></a>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> <div class="flex items-center gap-3 sm:ml-auto"><a href="https://railway.com/deploy/spSvic?referralCode=1Pn7vs&amp;utm_medium=integration&amp;utm_source=template&amp;utm_campaign=generic" target="_blank" rel="noopener noreferrer" class="transition-transform duration-300 hover:scale-105"><img src="https://railway.com/button.svg" alt="Deploy on Railway" class="h-8"/></a> <a href="https://zeabur.com/templates/1YRTMI?referralCode=rajnandan1" target="_blank" rel="noopener noreferrer" class="transition-transform duration-300 hover:scale-105"><img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur" class="h-8"/></a></div></div> <div class="fade-up mt-20 svelte-1ppbv43" style="animation-delay: 400ms"><div class="shot-window svelte-1ppbv43"><div class="shot-bar svelte-1ppbv43"><span class="shot-dots svelte-1ppbv43" aria-hidden="true"><i class="svelte-1ppbv43"></i><i class="svelte-1ppbv43"></i><i class="svelte-1ppbv43"></i></span> <span class="shot-url svelte-1ppbv43">status.your-company.com</span></div> <img${$.attr('src', `${$.stringify(base)}/xt_white.webp`)} alt="Kener open source status page dashboard: uptime monitoring, incident management, and Docker deployment" class="bg-muted h-auto w-full object-cover dark:hidden" loading="eager" fetchpriority="high" decoding="async" width="2062" height="1146"/> <img${$.attr('src', `${$.stringify(base)}/xt_black.webp`)} alt="Kener open source status page dashboard: uptime monitoring, incident management, and Docker deployment" class="bg-muted hidden h-auto w-full object-cover dark:block" loading="eager" decoding="async" width="2056" height="1138"/></div></div></div></section> <section class="px-5 pt-24 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="rail svelte-1ppbv43"><h2 class="rail-title svelte-1ppbv43">Status page monitoring features</h2> <span class="rail-rule svelte-1ppbv43" aria-hidden="true"></span> <span class="rail-meta svelte-1ppbv43"><span class="rail-meta-dot svelte-1ppbv43" aria-hidden="true"></span>12 / 12 operational</span></div> <p class="text-muted-foreground mt-4 max-w-[65ch] text-sm leading-[1.7]">From uptime monitoring to incident management: everything you need to run a production status page.</p> <div class="rows mt-10 svelte-1ppbv43"><!--[-->`);

		const each_array_2 = $.ensure_array_like(coreFeatures);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let feature = each_array_2[$$index_2];

			if (feature.href) {
				$$renderer.push(`<!--[0--><a${$.attr('href', getHref(feature.href))} class="row group svelte-1ppbv43"><span class="row-dot svelte-1ppbv43" aria-hidden="true"></span> <span class="row-title svelte-1ppbv43">${$.escape(feature.title)}</span> <span class="row-desc svelte-1ppbv43">${$.escape(feature.description)}</span> <span class="row-action svelte-1ppbv43">Docs `);

				ArrowRight($$renderer, {
					class: 'h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5'
				});

				$$renderer.push(`<!----></span></a>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="row svelte-1ppbv43"><span class="row-dot svelte-1ppbv43" aria-hidden="true"></span> <span class="row-title svelte-1ppbv43">${$.escape(feature.title)}</span> <span class="row-desc svelte-1ppbv43">${$.escape(feature.description)}</span> <span class="row-action svelte-1ppbv43"></span></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="px-5 pt-24 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="rail svelte-1ppbv43"><h2 class="rail-title svelte-1ppbv43">Advanced ops &amp; admin tools</h2> <span class="rail-rule svelte-1ppbv43" aria-hidden="true"></span> <span class="rail-meta svelte-1ppbv43">admin</span></div> <p class="text-muted-foreground mt-4 max-w-[65ch] text-sm leading-[1.7]">Self-hosted status page with deep operational tooling: secrets vault, triggers, API keys, and analytics.</p> <div class="rows mt-10 svelte-1ppbv43"><!--[-->`);

		const each_array_3 = $.ensure_array_like(advancedFeatures);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let feature = each_array_3[$$index_3];

			$$renderer.push(`<div class="row svelte-1ppbv43"><span class="row-dot svelte-1ppbv43" aria-hidden="true"></span> <span class="row-title svelte-1ppbv43">${$.escape(feature.title)}</span> <span class="row-desc svelte-1ppbv43">${$.escape(feature.description)}</span> <span class="row-action svelte-1ppbv43"></span></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="px-5 pt-24 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="rail svelte-1ppbv43"><h2 class="rail-title svelte-1ppbv43">Kener documentation</h2> <span class="rail-rule svelte-1ppbv43" aria-hidden="true"></span> <span class="rail-meta svelte-1ppbv43">guides &amp; reference</span></div> <p class="text-muted-foreground mt-4 max-w-[65ch] text-sm leading-[1.7]">Guides for Docker deployment, monitor configuration, incident workflows, and API integration.</p> <div class="mt-10 grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);

		const each_array_4 = $.ensure_array_like(getGroupHighlights());

		for (let $$index_5 = 0, $$length = each_array_4.length; $$index_5 < $$length; $$index_5++) {
			let group = each_array_4[$$index_5];

			$$renderer.push(`<div><h3 class="text-foreground text-sm font-semibold tracking-tight">${$.escape(group.group)}</h3> <ul class="mt-3 space-y-1"><!--[-->`);

			const each_array_5 = $.ensure_array_like(group.pages);

			for (let $$index_4 = 0, $$length = each_array_5.length; $$index_4 < $$length; $$index_4++) {
				let page = each_array_5[$$index_4];

				$$renderer.push(`<li><a${$.attr('href', getHref(`/docs/${page.slug}`))} class="text-muted-foreground hover:text-primary group flex items-center justify-between gap-3 border-b border-transparent py-1.5 text-sm transition-colors duration-300"><span>${$.escape(page.title)}</span> `);

				ArrowRight($$renderer, {
					class: 'h-3.5 w-3.5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-60'
				});

				$$renderer.push(`<!----></a></li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="px-5 pt-24 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="rail svelte-1ppbv43"><h2 class="rail-title svelte-1ppbv43">How Kener compares</h2> <span class="rail-rule svelte-1ppbv43" aria-hidden="true"></span> <span class="rail-meta svelte-1ppbv43">4 tools</span></div> <p class="text-muted-foreground mt-4 max-w-[65ch] text-sm leading-[1.7]">See how Kener stacks up against popular open-source and SaaS status page tools.</p> <div class="mt-10 overflow-x-auto"><table class="cmp-table w-full text-sm svelte-1ppbv43"><thead><tr><th class="cmp-feature svelte-1ppbv43">Feature</th><th class="cmp-kener svelte-1ppbv43">Kener</th><th class="svelte-1ppbv43">Upptime</th><th class="svelte-1ppbv43">Uptime Kuma</th><th class="svelte-1ppbv43">Statuspage</th></tr></thead><tbody class="svelte-1ppbv43"><!--[-->`);

		const each_array_6 = $.ensure_array_like(comparisonRows);

		for (let $$index_7 = 0, $$length = each_array_6.length; $$index_7 < $$length; $$index_7++) {
			let row = each_array_6[$$index_7];

			$$renderer.push(`<tr class="svelte-1ppbv43"><td class="cmp-feature svelte-1ppbv43">${$.escape(row.feature)}</td><td class="cmp-kener svelte-1ppbv43">${$.escape(row.kener)}</td><!--[-->`);

			const each_array_7 = $.ensure_array_like(row.others);

			for (let i = 0, $$length = each_array_7.length; i < $$length; i++) {
				let value = each_array_7[i];

				$$renderer.push(`<td class="svelte-1ppbv43">${$.escape(value)}</td>`);
			}

			$$renderer.push(`<!--]--></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="mt-10"><a${$.attr('href', getHref("/docs/guides/comparison"))} class="cta-pill-secondary group inline-flex svelte-1ppbv43"><span class="text-sm font-medium tracking-tight">View full comparison</span> `);

		ArrowRight($$renderer, {
			class: 'h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5'
		});

		$$renderer.push(`<!----></a></div></div></section> <section class="px-5 pt-24 pb-8 md:px-8 md:pt-32"><div class="mx-auto max-w-[1080px]"><div class="gh-panel md:flex md:items-center md:justify-between md:gap-10 svelte-1ppbv43"><div><h2 class="text-foreground text-xl font-semibold tracking-tight">Star Kener on GitHub</h2> <p class="text-muted-foreground mt-2 max-w-[58ch] text-sm leading-[1.65]">Join the open-source community. Contribute features, report issues, and help build the best free status page
            platform.</p></div> <a href="https://github.com/rajnandan1/kener" target="_blank" rel="noopener noreferrer" class="cta-github-pill group mt-6 shrink-0 md:mt-0 svelte-1ppbv43">`);

		Github($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----> <span class="text-sm font-semibold tracking-tight">Star on GitHub</span> <span class="cta-github-icon svelte-1ppbv43">`);

		ArrowRight($$renderer, {
			class: 'h-3 w-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-px'
		});

		$$renderer.push(`<!----></span></a></div></div></section> <footer class="border-border/60 mt-16 border-t px-5 py-10 md:px-8"><div class="mx-auto flex max-w-[1080px] flex-col items-start justify-between gap-4 md:flex-row md:items-center"><p class="text-muted-foreground text-sm tracking-tight">Free and open source, MIT licensed.</p> `);

		if (data.config.footerLinks) {
			$$renderer.push(`<!--[0--><div class="flex flex-wrap items-center gap-6"><!--[-->`);

			const each_array_8 = $.ensure_array_like(data.config.footerLinks);

			for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
				let link = each_array_8[$$index_8];

				$$renderer.push(`<a${$.attr('href', link.url)} target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground text-sm font-medium tracking-tight transition-colors duration-300">${$.escape(link.name)}</a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></footer></div>`);
	});
}