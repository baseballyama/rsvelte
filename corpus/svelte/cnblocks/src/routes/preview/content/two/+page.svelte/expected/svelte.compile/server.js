import * as $ from 'svelte/internal/server';
import { content } from "$lib/all_blocks/content";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = content.find((item) => item.title === "two");

		if (!block) {
			throw new Error("Missing preview block for two in content");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}