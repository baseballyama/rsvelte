import * as $ from 'svelte/internal/server';
import { cta } from "$lib/all_blocks/cta";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = cta.find((item) => item.title === "three");

		if (!block) {
			throw new Error("Missing preview block for three in cta");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}