import * as $ from 'svelte/internal/server';
import { footer } from "$lib/all_blocks/footer";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = footer.find((item) => item.title === "one");

		if (!block) {
			throw new Error("Missing preview block for one in footer");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}