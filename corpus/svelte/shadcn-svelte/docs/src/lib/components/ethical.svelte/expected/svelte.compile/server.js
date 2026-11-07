import * as $ from 'svelte/internal/server';
import { dev, browser } from "$app/environment";
import { beforeNavigate } from "$app/navigation";

export default function Ethical($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		beforeNavigate((navigation) => {
			const isDocIndex = navigation.from?.route.id === "/(app)/(layout)/docs";

			if (isDocIndex) return;

			const goingToDocIndex = navigation.to?.route.id === "/(app)/(layout)/docs";

			if (goingToDocIndex) return;

			refreshEthicalAds();
		});

		function refreshEthicalAds() {
			if (dev) return;
			if (!browser || typeof window === "undefined") return;

			if ("ethicalads" in window) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				window.ethicalads?.reload();
			}
		}

		if (!dev) {
			$$renderer.push(`<!--[0--><div class="pt-4"><div data-ea-publisher="shadcn-sveltecom" data-ea-type="image"></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}