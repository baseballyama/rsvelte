import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { comparator } from "$lib/all_blocks/comparator";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = comparator.find((item) => item.title === "one");

	if (!block) {
		throw new Error("Missing preview block for one in comparator");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}