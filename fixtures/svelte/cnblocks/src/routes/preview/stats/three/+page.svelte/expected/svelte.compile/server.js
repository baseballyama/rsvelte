import * as $ from 'svelte/internal/server';
import { stats } from "$lib/all_blocks/stats";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = stats.find((item) => item.title === "three");

		if (!block) {
			throw new Error("Missing preview block for three in stats");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}