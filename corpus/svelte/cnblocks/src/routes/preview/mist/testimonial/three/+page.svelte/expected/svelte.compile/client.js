import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_mists_testimonial } from "$lib/all_mists/testimonial";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = all_mists_testimonial.find((item) => item.slug === "three");

	if (!block) {
		throw new Error("Missing preview block for three in all_mists_testimonial");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}