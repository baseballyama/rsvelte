import * as $ from 'svelte/internal/server';
import { hero } from "$lib/all_blocks/hero";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = hero.find((item) => item.title === "four");

		if (!block) {
			throw new Error("Missing preview block for four in hero");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}