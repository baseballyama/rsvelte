import * as $ from 'svelte/internal/server';
import { all_mists_comparator } from "$lib/all_mists/comparator";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = all_mists_comparator.find((item) => item.slug === "one");

		if (!block) {
			throw new Error("Missing preview block for one in all_mists_comparator");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}