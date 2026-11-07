import * as $ from 'svelte/internal/server';
import { hero } from "$lib/all_blocks/hero";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = hero.find((item) => item.title === "two");

		if (!block) {
			throw new Error("Missing preview block for two in hero");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}