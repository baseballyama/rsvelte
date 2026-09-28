import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { feature } from "$lib/all_blocks/features";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = feature.find((item) => item.title === "eleven");

	if (!block) {
		throw new Error("Missing preview block for eleven in feature");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}