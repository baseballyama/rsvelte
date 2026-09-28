import * as $ from 'svelte/internal/server';
import { all_mists_stats } from "$lib/all_mists/stats";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = all_mists_stats.find((item) => item.slug === "one");

		if (!block) {
			throw new Error("Missing preview block for one in all_mists_stats");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}