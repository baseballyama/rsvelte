import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_mists_pricing } from "$lib/all_mists/pricing";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = all_mists_pricing.find((item) => item.slug === "two");

	if (!block) {
		throw new Error("Missing preview block for two in all_mists_pricing");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}