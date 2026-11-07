import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { testimonials } from "$lib/all_blocks/testimonial";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = testimonials.find((item) => item.title === "two");

	if (!block) {
		throw new Error("Missing preview block for two in testimonials");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}