import * as $ from 'svelte/internal/server';
import { all_mists_footer } from "$lib/all_mists/footer";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = all_mists_footer.find((item) => item.slug === "three");

		if (!block) {
			throw new Error("Missing preview block for three in all_mists_footer");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}