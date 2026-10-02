import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_mists_heros } from "$lib/all_mists/hero";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = all_mists_heros.find((item) => item.slug === "five");

	if (!block) {
		throw new Error("Missing preview block for five in all_mists_heros");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}