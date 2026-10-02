import * as $ from 'svelte/internal/server';
import { all_mists_testimonial } from "$lib/all_mists/testimonial";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = all_mists_testimonial.find((item) => item.slug === "five");

		if (!block) {
			throw new Error("Missing preview block for five in all_mists_testimonial");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}