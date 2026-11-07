import * as $ from 'svelte/internal/server';
import { login } from "$lib/all_blocks/login";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = login.find((item) => item.title === "one");

		if (!block) {
			throw new Error("Missing preview block for one in login");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}