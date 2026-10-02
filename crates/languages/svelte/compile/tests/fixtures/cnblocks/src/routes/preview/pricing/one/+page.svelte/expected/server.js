import * as $ from 'svelte/internal/server';
import { pricing } from "$lib/all_blocks/pricing";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = pricing.find((item) => item.title === "one");

		if (!block) {
			throw new Error("Missing preview block for one in pricing");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}