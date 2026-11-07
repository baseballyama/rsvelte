import * as $ from 'svelte/internal/server';
import { all_mists_login } from "$lib/all_mists/login";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = all_mists_login.find((item) => item.slug === "one");

		if (!block) {
			throw new Error("Missing preview block for one in all_mists_login");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}