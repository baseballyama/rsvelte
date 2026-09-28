import * as $ from 'svelte/internal/server';
import { feature } from "$lib/all_blocks/features";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = feature.find((item) => item.title === "eight");

		if (!block) {
			throw new Error("Missing preview block for eight in feature");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}