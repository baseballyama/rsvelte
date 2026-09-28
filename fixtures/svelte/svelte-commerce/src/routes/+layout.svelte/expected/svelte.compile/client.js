import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../app.css';
import { Toaster } from '@misiki/kitcommerce-core';
import { getThemeFontsUrl } from '$lib/theme/index.js';
import { setUserState } from '$lib/core/stores/index.js';
import { GoogleAnalytics } from '$lib/core/components/index.js';
import KlaviyoPlugin from '$lib/core/components/plugins/klaviyo-plugin.svelte';
import { navigating } from '$app/stores';
import { updated } from '$app/state';
import { afterNavigate, beforeNavigate } from '$app/navigation';
import { browser } from '$app/environment';
import { Loader } from '@lucide/svelte';
import { ColorPalette } from '$lib/core/components/index.js';
import StoreFont from '$lib/components/common/store-font.svelte';
import StorePalette from '$lib/components/common/store-palette.svelte';

var root = $.from_html(`<link rel="preconnect"/>`);
var root_1 = $.from_html(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link rel="preload" as="style"/> <link rel="stylesheet"/>`, 1);
var root_2 = $.from_html(`<!> <link rel="icon"/> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm" role="status"><div class="rounded-lg bg-white p-4"><!> <span class="sr-only">Loading</span></div></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <div><div class="min-h-screen bg-background"><!> <!></div></div> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $navigating = () => $.store_get(navigating, '$navigating', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	setUserState();

	const themeFontsUrl = $.derived(() => getThemeFontsUrl($$props.data?.theme?.name || 'default'));

	// Themes built on the section library keep their look in the API and ship it on the store
	// payload. Inlining it here means the theme's CSS is already in the SSR head — no extra
	// request and nothing cross-origin blocking first paint, which a linked API stylesheet would.
	// The tag name is split on purpose: Svelte's preprocessor treats any literal `<style>` in the
	// file as this component's own stylesheet, even inside a string, and tries to compile it.
	const STYLE_OPEN = '<sty' + 'le id="theme-css">';

	const STYLE_CLOSE = '</sty' + 'le>';

	const themeStyleTag = $.derived(() => $$props.data?.store?.themeCss
		? STYLE_OPEN + $$props.data.store.themeCss + STYLE_CLOSE
		: '');

	// Stale-client protection. SvelteKit's `updated` store flips to true once the
	// deployed build (via _app/version.json polling) no longer matches the running
	// client. We then load fresh code so mobile/PWA users never keep running an
	// old bundle:
	//  - on the next in-app navigation (hard load instead of client-side nav)
	//  - immediately while the tab sits idle (covers webviews in the background)
	beforeNavigate((nav) => {
		if (updated.current && nav.to?.url && !nav.willUnload) {
			location.href = nav.to.url.href;
		}
	});

	// Auto-update as soon as a new deployment is detected, even while the tab
	// sits idle (e.g. inside a mobile webview) — don't wait for a navigation.
	$.user_effect(() => {
		if (browser && updated.current) {
			location.reload();
		}
	});

	// Also re-check on every navigation so a stale webview updates promptly.
	afterNavigate(() => {
		if (browser) updated.check();
	});

	// Origin serving product imagery — usually the LCP element and always a different host from
	// the document, so without a preconnect the browser pays DNS + TCP + TLS before the fetch can
	// even start (~100ms measured on a production storefront). Derived at runtime rather than
	// hardcoded so it follows whatever store/CDN this theme is deployed against. The Cloudflare
	// provider falls back to the image's own origin when no explicit CDN prefix is configured, so
	// fall back to a known store asset in that case.
	const imageCdnOrigin = $.derived(() => {
		const cdn = $$props.data?.store?.plugins?.imageCdn;

		if (!cdn?.active) return '';

		try {
			return new URL(cdn.url || $$props.data?.store?.logo || $$props.data?.store?.favicon).origin;
		} catch {
			return '';
		}
	});

	var fragment_4 = root_4();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = root_2();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var link = root();

				$.template_effect(() => $.set_attribute(link, 'href', $.get(imageCdnOrigin)));
				$.append($$anchor, link);
			};

			$.if(node, ($$render) => {
				if ($.get(imageCdnOrigin)) $$render(consequent);
			});
		}

		var link_1 = $.sibling(node, 2);
		var node_1 = $.sibling(link_1, 2);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_1 = root_1();
				var link_2 = $.sibling($.first_child(fragment_1), 4);
				var link_3 = $.sibling(link_2, 2);

				$.template_effect(() => {
					$.set_attribute(link_2, 'href', $.get(themeFontsUrl));
					$.set_attribute(link_3, 'href', $.get(themeFontsUrl));
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node_1, ($$render) => {
				if ($.get(themeFontsUrl)) $$render(consequent_1);
			});
		}

		var node_2 = $.sibling(node_1, 2);

		{
			var consequent_2 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.html(node_3, () => $.get(themeStyleTag));
				$.append($$anchor, fragment_2);
			};

			$.if(node_2, ($$render) => {
				if ($.get(themeStyleTag)) $$render(consequent_2);
			});
		}

		var node_4 = $.sibling(node_2, 2);

		{
			var consequent_3 = ($$anchor) => {
				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				$.html(node_5, () => $$props.data?.store?.plugins?.headerScripts?.html);
				$.append($$anchor, fragment_3);
			};

			$.if(node_4, ($$render) => {
				if ($$props.data?.store?.plugins?.headerScripts?.active) $$render(consequent_3);
			});
		}

		$.template_effect(() => $.set_attribute(link_1, 'href', $$props.data?.store?.favicon || '/favicon.png'));
		$.append($$anchor, fragment);
	});

	var node_6 = $.first_child(fragment_4);

	ColorPalette(node_6, {});

	var node_7 = $.sibling(node_6, 2);

	StorePalette(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	StoreFont(node_8, {});

	var node_9 = $.sibling(node_8, 2);

	GoogleAnalytics(node_9, {});

	var node_10 = $.sibling(node_9, 2);

	{
		let $0 = $.derived(() => $$props.data?.store);

		KlaviyoPlugin(node_10, {
			get storeData() {
				return $.get($0);
			}
		});
	}

	var div = $.sibling(node_10, 2);
	var div_1 = $.child(div);
	var node_11 = $.child(div_1);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_12 = $.first_child(fragment_5);

			$.await(
				node_12,
				() => new Promise((resolve) => setTimeout(resolve, 700)),
				null,
				($$anchor, _) => {
					var div_2 = root_3();
					var div_3 = $.child(div_2);
					var node_13 = $.child(div_3);

					Loader(node_13, { class: 'animate-spin' });
					$.next(2);
					$.reset(div_3);
					$.reset(div_2);
					$.append($$anchor, div_2);
				},
				($$anchor) => {}
			);

			$.append($$anchor, fragment_5);
		};

		$.if(node_11, ($$render) => {
			if (!!$navigating()) $$render(consequent_4);
		});
	}

	var node_14 = $.sibling(node_11, 2);

	$.snippet(node_14, () => $$props.children);
	$.reset(div_1);
	$.reset(div);

	var node_15 = $.sibling(div, 2);

	Toaster(node_15, { position: 'top-center' });

	$.template_effect(() => {
		$.set_class(div, 1, `light min-h-screen theme-${($$props.data?.theme?.name || 'default') ?? ''}`);
		$.set_attribute(div, 'data-theme', $$props.data?.theme?.name || 'default');
		$.set_attribute(div, 'data-theme-source', $$props.data?.theme?.source || 'default');
	});

	$.append($$anchor, fragment_4);
	$.pop();
	$$cleanup();
}