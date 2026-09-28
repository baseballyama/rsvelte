import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { settings } from 'svelte-ux';
import posthog from 'posthog-js';
import { watch } from 'runed';
import { dev } from '$app/environment';
import { afterNavigate } from '$app/navigation';
import { page } from '$app/state';
import { preparePageTransition } from '@layerstack/docs/page-transitions';
import '@fontsource-variable/inter';
import '../app.css';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;

		// Apply theme settings
		settings({
			components: {},
			// svelte-ignore state_referenced_locally
			themes: data.themes
		});

		let currentPath = '';

		onMount(() => {
			// Delay adding `scroll-smooth` to `<html>` as provides better refresh experience
			// and fixes issue where sometimes doesn't scroll far enough
			setTimeout(
				() => {
					document.documentElement.classList.add('scroll-smooth');
				},
				0
			);

			// Posthog analytics
			if (!dev) {
				watch(() => page, () => {
					if (currentPath && currentPath !== page.url.pathname) {
						// Page navigated away
						posthog.capture('$pageleave');
					}

					// Page entered
					currentPath = page.url.pathname;

					posthog.capture('$pageview');
				});

				const handleBeforeUnload = () => {
					// Hard reloads or browser exit
					posthog.capture('$pageleave');
				};

				window.addEventListener('beforeunload', handleBeforeUnload);

				return () => {
					window.removeEventListener('beforeunload', handleBeforeUnload);
				};
			}
		});

		// View transition for navigation
		preparePageTransition();

		// Scroll to hash target after client-side navigation (View Transitions can prevent native hash scrolling)
		afterNavigate(() => {
			const hash = window.location.hash;

			if (hash) {
				const el = document.querySelector(hash);

				if (el) {
					// Use requestAnimationFrame to ensure the view transition has finished rendering
					requestAnimationFrame(() => {
						el.scrollIntoView();
					});
				}
			}
		});

		const defaultDescription = 'Composable Svelte chart components to build a large variety of visualizations';

		let pageTitle = $.derived(() => page.data.metadata?.name
			? `${page.data.metadata.name} | LayerChart`
			: 'LayerChart');

		let pageDescription = $.derived(() => page.data.metadata?.description ?? defaultDescription);

		// TODO: Switch back to dynamic satori-based OG image once Cloudflare compatibility is resolved
		// let ogImageUrl = $derived(
		// 	`${page.url.origin}/og?title=${encodeURIComponent(page.data.metadata?.name ?? 'LayerChart')}${page.data.metadata?.description ? `&description=${encodeURIComponent(page.data.metadata.description)}` : `&description=${encodeURIComponent(defaultDescription)}`}${page.data.metadata?.category ? `&component=${encodeURIComponent(page.data.metadata.category)}` : ''}`
		// );
		let ogImageUrl = $.derived(() => `${page.url.origin}/images/og-image.png`);

		$.head('31hqwf', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(pageTitle())}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', pageDescription())}/> <meta property="og:type" content="website"/> <meta property="og:title"${$.attr('content', pageTitle())}/> <meta property="og:description"${$.attr('content', pageDescription())}/> <meta property="og:image"${$.attr('content', ogImageUrl())}/> <meta property="og:image:width" content="1200"/> <meta property="og:image:height" content="630"/> <meta property="og:url"${$.attr('content', page.url.href)}/> <meta property="og:site_name" content="LayerChart"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site" content="@techniq35"/> <meta name="twitter:title"${$.attr('content', pageTitle())}/> <meta name="twitter:description"${$.attr('content', pageDescription())}/> <meta name="twitter:image"${$.attr('content', ogImageUrl())}/> <link rel="icon" href="/favicon.svg" type="image/svg+xml"/> `);

			if (page.url.origin.includes('https')) {
				$$renderer.push(`<!--[0--><script defer="" src="https://static.cloudflareinsights.com/beacon.min.js"${$.attr('data-cf-beacon', JSON.stringify({ token: 'aff39463882545fd8cca0adba6afa86e' }))}></script>`);
				$$renderer.push(` `);
				$$renderer.push(`<script async="" defer="" src="https://us.umami.is/script.js" data-website-id="98141640-7328-4228-ba7b-2287da133ee9"></script>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<div data-sveltekit-preload-data="off">`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}