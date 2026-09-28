import * as $ from 'svelte/internal/server';
import { content } from "$lib/all_blocks/content";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = content.find((item) => item.title === "five");

		if (!block) {
			throw new Error("Missing preview block for five in content");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}