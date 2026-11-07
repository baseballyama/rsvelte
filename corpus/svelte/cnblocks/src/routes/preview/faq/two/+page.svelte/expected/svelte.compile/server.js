import * as $ from 'svelte/internal/server';
import { faq } from "$lib/all_blocks/faq";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = faq.find((item) => item.title === "two");

		if (!block) {
			throw new Error("Missing preview block for two in faq");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}