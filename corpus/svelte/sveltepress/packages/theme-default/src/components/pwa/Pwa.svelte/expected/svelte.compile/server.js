import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import { isDark } from '../layout';

export default function Pwa($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let ReloadPrompt = void 0;
		let webManifest = void 0;

		onMount(async () => {
			if (themeOptions.pwa) {
				const { pwaInfo } = await import('virtual:pwa-info');

				webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';

				if (pwaInfo) {
					ReloadPrompt = (await import('./ReloadPrompt.svelte')).default;
				}
			}
		});

		$.head('172e0tx', $$renderer, ($$renderer) => {
			if (themeOptions?.pwa?.darkManifest && $.store_get($$store_subs ??= {}, '$isDark', isDark)) {
				$$renderer.push(`<!--[0--><meta rel="manifest"${$.attr('href', themeOptions.pwa.darkManifest)}/>`);
			} else {
				$$renderer.push(`<!--[-1-->${$.html(webManifest)}`);
			}

			$$renderer.push(`<!--]-->`);
		});

		if (ReloadPrompt) {
			$$renderer.push('<!--[0-->');

			if (ReloadPrompt) {
				$$renderer.push('<!--[-->');
				ReloadPrompt($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}