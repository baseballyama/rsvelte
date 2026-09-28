import * as $ from 'svelte/internal/server';
import { logocloud } from "$lib/all_blocks/logo-cloud";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = logocloud.find((item) => item.title === "three");

		if (!block) {
			throw new Error("Missing preview block for three in logocloud");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}