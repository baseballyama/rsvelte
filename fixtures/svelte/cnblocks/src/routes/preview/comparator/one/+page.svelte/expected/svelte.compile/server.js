import * as $ from 'svelte/internal/server';
import { comparator } from "$lib/all_blocks/comparator";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = comparator.find((item) => item.title === "one");

		if (!block) {
			throw new Error("Missing preview block for one in comparator");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}