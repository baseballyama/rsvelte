import * as $ from 'svelte/internal/server';
import { faq } from "$lib/all_blocks/faq";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = faq.find((item) => item.title === "four");

		if (!block) {
			throw new Error("Missing preview block for four in faq");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}