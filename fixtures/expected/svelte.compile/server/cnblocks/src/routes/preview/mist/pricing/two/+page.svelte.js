import * as $ from 'svelte/internal/server';
import { all_mists_pricing } from "$lib/all_mists/pricing";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = all_mists_pricing.find((item) => item.slug === "two");

		if (!block) {
			throw new Error("Missing preview block for two in all_mists_pricing");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}