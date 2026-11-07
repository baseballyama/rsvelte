import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { navigating } from "$app/state";

var root = $.from_html(`<aside class="fixed right-5 bottom-5 z-50 hidden sm:block"><div id="carbon-container"></div></aside>`);

export default function CarbonAds($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		// refreshCarbonAds();
	});

	$.user_effect(() => {
		if (navigating.complete) {
			refreshCarbonAds();
		}
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

	var aside = root();

	$.append($$anchor, aside);
	$.pop();
}