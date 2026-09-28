import * as $ from 'svelte/internal/server';
import { signup } from "$lib/all_blocks/signup";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = signup.find((item) => item.title === "two");

		if (!block) {
			throw new Error("Missing preview block for two in signup");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}