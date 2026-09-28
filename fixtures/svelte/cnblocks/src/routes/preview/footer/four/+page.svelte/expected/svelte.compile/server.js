import * as $ from 'svelte/internal/server';
import { footer } from "$lib/all_blocks/footer";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = footer.find((item) => item.title === "four");

		if (!block) {
			throw new Error("Missing preview block for four in footer");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}