import * as $ from 'svelte/internal/server';
import { all_mists_content } from "$lib/all_mists/content";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = all_mists_content.find((item) => item.slug === "two");

		if (!block) {
			throw new Error("Missing preview block for two in all_mists_content");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}