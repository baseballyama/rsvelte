import * as $ from 'svelte/internal/server';
import { signup } from "$lib/all_blocks/signup";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = signup.find((item) => item.title === "one");

		if (!block) {
			throw new Error("Missing preview block for one in signup");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}