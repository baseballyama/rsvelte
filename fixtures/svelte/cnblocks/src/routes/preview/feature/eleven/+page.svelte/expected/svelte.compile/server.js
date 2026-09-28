import * as $ from 'svelte/internal/server';
import { feature } from "$lib/all_blocks/features";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = feature.find((item) => item.title === "eleven");

		if (!block) {
			throw new Error("Missing preview block for eleven in feature");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}