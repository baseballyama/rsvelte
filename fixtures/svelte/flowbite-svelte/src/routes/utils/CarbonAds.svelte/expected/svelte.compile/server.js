import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { navigating } from "$app/state";

export default function CarbonAds($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			// refreshCarbonAds();
		});

		function refreshCarbonAds() {
			const isCarbonAdsRendered = document.querySelector("#carbonads");

			if (isCarbonAdsRendered) {
				window._carbonads.refresh();
			} else {
				const script = document.createElement("script");

				script.async = true;
				script.id = "_carbonads_js";
				script.src = "//cdn.carbonads.com/carbon.js?serve=CEAIC53I&placement=flowbite-sveltecom";

				const container = document.querySelector("#carbon-container");

				if (container) {
					container.appendChild(script);
				}
			}
		}

		$$renderer.push(`<aside class="fixed right-5 bottom-5 z-50 hidden sm:block"><div id="carbon-container"></div></aside>`);
	});
}