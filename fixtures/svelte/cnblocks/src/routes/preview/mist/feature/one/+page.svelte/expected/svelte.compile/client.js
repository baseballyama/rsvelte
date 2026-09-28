import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_mists_features } from "$lib/all_mists/feature";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = all_mists_features.find((item) => item.slug === "one");

	if (!block) {
		throw new Error("Missing preview block for one in all_mists_features");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}