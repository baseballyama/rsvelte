import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { stats } from "$lib/all_blocks/stats";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = stats.find((item) => item.title === "one");

	if (!block) {
		throw new Error("Missing preview block for one in stats");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}