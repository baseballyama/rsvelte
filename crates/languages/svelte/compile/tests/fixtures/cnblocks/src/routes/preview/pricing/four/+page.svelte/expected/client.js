import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pricing } from "$lib/all_blocks/pricing";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = pricing.find((item) => item.title === "four");

	if (!block) {
		throw new Error("Missing preview block for four in pricing");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}