import * as $ from 'svelte/internal/server';
import { testimonials } from "$lib/all_blocks/testimonial";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = testimonials.find((item) => item.title === "four");

		if (!block) {
			throw new Error("Missing preview block for four in testimonials");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}