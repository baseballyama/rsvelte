import * as $ from 'svelte/internal/server';
import { contact } from "$lib/all_blocks/contact";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = contact.find((item) => item.title === "two");

		if (!block) {
			throw new Error("Missing preview block for two in contact");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}