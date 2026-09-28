import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_mists_logocloud } from "$lib/all_mists/logocloud";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = all_mists_logocloud.find((item) => item.slug === "one");

	if (!block) {
		throw new Error("Missing preview block for one in all_mists_logocloud");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}