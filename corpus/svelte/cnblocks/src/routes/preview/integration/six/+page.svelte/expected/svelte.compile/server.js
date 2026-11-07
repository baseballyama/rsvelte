import * as $ from 'svelte/internal/server';
import { integration } from "$lib/all_blocks/integration";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = integration.find((item) => item.title === "six");

		if (!block) {
			throw new Error("Missing preview block for six in integration");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}