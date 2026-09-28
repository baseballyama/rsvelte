import * as $ from 'svelte/internal/server';
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

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children, data } = $$props;

		setUserState();

		const themeFontsUrl = $.derived(() => getThemeFontsUrl(data?.theme?.name || 'default'));

		// Themes built on the section library keep their look in the API and ship it on the store
		// payload. Inlining it here means the theme's CSS is already in the SSR head — no extra
		// request and nothing cross-origin blocking first paint, which a linked API stylesheet would.
		// The tag name is split on purpose: Svelte's preprocessor treats any literal `<style>` in the
		// file as this component's own stylesheet, even inside a string, and tries to compile it.
		const STYLE_OPEN = '<sty' + 'le id="theme-css">';

		const STYLE_CLOSE = '</sty' + 'le>';
		const themeStyleTag = $.derived(() => data?.store?.themeCss ? STYLE_OPEN + data.store.themeCss + STYLE_CLOSE : '');

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
			const cdn = data?.store?.plugins?.imageCdn;

			if (!cdn?.active) return '';

			try {
				return new URL(cdn.url || data?.store?.logo || data?.store?.favicon).origin;
			} catch {
				return '';
			}
		});

		$.head('12qhfyh', $$renderer, ($$renderer) => {
			if (imageCdnOrigin()) {
				$$renderer.push(`<!--[0--><link rel="preconnect"${$.attr('href', imageCdnOrigin())}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <link rel="icon"${$.attr('href', data?.store?.favicon || '/favicon.png')}/> `);

			if (themeFontsUrl()) {
				$$renderer.push(`<!--[0--><link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link rel="preload" as="style"${$.attr('href', themeFontsUrl())}/> <link${$.attr('href', themeFontsUrl())} rel="stylesheet"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (themeStyleTag()) {
				$$renderer.push(`<!--[0-->${$.html(themeStyleTag())}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (data?.store?.plugins?.headerScripts?.active) {
				$$renderer.push(`<!--[0-->${$.html(data?.store?.plugins?.headerScripts?.html)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		ColorPalette($$renderer, {});
		$$renderer.push(`<!----> `);
		StorePalette($$renderer, {});
		$$renderer.push(`<!----> `);
		StoreFont($$renderer, {});
		$$renderer.push(`<!----> `);
		GoogleAnalytics($$renderer, {});
		$$renderer.push(`<!----> `);
		KlaviyoPlugin($$renderer, { storeData: data?.store });
		$$renderer.push(`<!----> <div${$.attr_class(`light min-h-screen theme-${$.stringify(data?.theme?.name || 'default')}`)}${$.attr('data-theme', data?.theme?.name || 'default')}${$.attr('data-theme-source', data?.theme?.source || 'default')}><div class="min-h-screen bg-background">`);

		if (!!$.store_get($$store_subs ??= {}, '$navigating', navigating)) {
			$$renderer.push('<!--[0-->');

			$.await($$renderer, new Promise((resolve) => setTimeout(resolve, 700)), () => {}, (_) => {
				$$renderer.push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm" role="status"><div class="rounded-lg bg-white p-4">`);
				Loader($$renderer, { class: 'animate-spin' });
				$$renderer.push(`<!----> <span class="sr-only">Loading</span></div></div>`);
			});

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children($$renderer);
		$$renderer.push(`<!----></div></div> `);
		Toaster($$renderer, { position: 'top-center' });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}