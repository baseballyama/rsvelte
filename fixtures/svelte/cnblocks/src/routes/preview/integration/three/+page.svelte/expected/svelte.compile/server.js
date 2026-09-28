import * as $ from 'svelte/internal/server';
import { integration } from "$lib/all_blocks/integration";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = integration.find((item) => item.title === "three");

		if (!block) {
			throw new Error("Missing preview block for three in integration");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}