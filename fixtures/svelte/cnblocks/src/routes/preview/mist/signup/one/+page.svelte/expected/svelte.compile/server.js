import * as $ from 'svelte/internal/server';
import { all_mists_signup } from "$lib/all_mists/signup";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = all_mists_signup.find((item) => item.slug === "one");

		if (!block) {
			throw new Error("Missing preview block for one in all_mists_signup");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}