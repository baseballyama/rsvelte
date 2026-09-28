import * as $ from 'svelte/internal/server';
import { cta } from "$lib/all_blocks/cta";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = cta.find((item) => item.title === "two");

		if (!block) {
			throw new Error("Missing preview block for two in cta");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}