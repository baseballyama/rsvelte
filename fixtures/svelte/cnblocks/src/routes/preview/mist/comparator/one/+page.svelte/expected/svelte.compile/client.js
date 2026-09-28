import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_mists_comparator } from "$lib/all_mists/comparator";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = all_mists_comparator.find((item) => item.slug === "one");

	if (!block) {
		throw new Error("Missing preview block for one in all_mists_comparator");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}