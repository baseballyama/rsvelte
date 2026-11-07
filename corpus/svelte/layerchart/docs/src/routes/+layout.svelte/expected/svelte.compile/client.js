import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.with_script($.from_html(`<script defer="" src="https://static.cloudflareinsights.com/beacon.min.js"></script> <script async="" defer="" src="https://us.umami.is/script.js" data-website-id="98141640-7328-4228-ba7b-2287da133ee9"></script>`, 1));
var root_1 = $.from_html(`<meta name="description"/> <meta property="og:type" content="website"/> <meta property="og:title"/> <meta property="og:description"/> <meta property="og:image"/> <meta property="og:image:width" content="1200"/> <meta property="og:image:height" content="630"/> <meta property="og:url"/> <meta property="og:site_name" content="LayerChart"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site" content="@techniq35"/> <meta name="twitter:title"/> <meta name="twitter:description"/> <meta name="twitter:image"/> <link rel="icon" href="/favicon.svg" type="image/svg+xml"/> <!>`, 1);
var root_2 = $.from_html(`<div data-sveltekit-preload-data="off"><!></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	// Apply theme settings
	settings({
		components: {},
		// svelte-ignore state_referenced_locally
		themes: $$props.data.themes
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

	var div = root_2();

	$.head('31hqwf', ($$anchor) => {
		var fragment = root_1();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 4);
		var meta_2 = $.sibling(meta_1, 2);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 6);
		var meta_5 = $.sibling(meta_4, 8);
		var meta_6 = $.sibling(meta_5, 2);
		var meta_7 = $.sibling(meta_6, 2);
		var node = $.sibling(meta_7, 4);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var script = $.first_child(fragment_1);

				$.set_attribute(script, 'data-cf-beacon', JSON.stringify({ token: 'aff39463882545fd8cca0adba6afa86e' }));
				$.next(2);
				$.append($$anchor, fragment_1);
			};

			var d = $.derived(() => page.url.origin.includes('https'));

			$.if(node, ($$render) => {
				if ($.get(d)) $$render(consequent);
			});
		}

		$.template_effect(() => {
			$.set_attribute(meta, 'content', $.get(pageDescription));
			$.set_attribute(meta_1, 'content', $.get(pageTitle));
			$.set_attribute(meta_2, 'content', $.get(pageDescription));
			$.set_attribute(meta_3, 'content', $.get(ogImageUrl));
			$.set_attribute(meta_4, 'content', page.url.href);
			$.set_attribute(meta_5, 'content', $.get(pageTitle));
			$.set_attribute(meta_6, 'content', $.get(pageDescription));
			$.set_attribute(meta_7, 'content', $.get(ogImageUrl));
		});

		$.deferred_template_effect(() => {
			$.document.title = $.get(pageTitle) ?? '';
		});

		$.append($$anchor, fragment);
	});

	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}