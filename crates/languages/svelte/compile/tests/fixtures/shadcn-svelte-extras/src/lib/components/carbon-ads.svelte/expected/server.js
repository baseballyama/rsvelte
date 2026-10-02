import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { beforeNavigate } from '$app/navigation';
import { dev, browser } from '$app/environment';

export default function Carbon_ads($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const localId = $.props_id($$renderer);
		const src = 'https://cdn.carbonads.com/carbon.js?serve=CW7IE53W&placement=wwwshadcn-svelte-extrascom&format=cover';
		let container = null;

		onMount(() => {
			if (!dev) {
				refreshCarbonAds();

				return () => {
					const scriptNode = container?.querySelector(`[data-id="${localId}"]`);
					const carbonNode = container?.querySelector(`#carbonads`);

					scriptNode?.remove();
					carbonNode?.remove();
				};
			}
		});

		beforeNavigate(() => refreshCarbonAds());

		function createCarbonScript() {
			const script = document.createElement('script');

			script.async = true;
			script.id = '_carbonads_js';
			script.src = src;
			script.type = 'text/javascript';
			script.dataset.id = localId;

			return script;
		}

		function refreshCarbonAds() {
			if (!dev) {
				if (!browser) return;

				const scriptNode = container?.querySelector("[data-id='_carbonads_js']");
				const carbonAdsNode = container?.querySelector('#carbonads');

				carbonAdsNode?.remove();
				scriptNode?.remove();

				const script = createCarbonScript();

				container = document.getElementById(localId);

				if (container) {
					container.appendChild(script);
				}
			}
		}

		$$renderer.push(`<div${$.attr('id', localId)} class="w-full pt-4"></div>`);
	});
}