import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_mists_cta } from "$lib/all_mists/cta";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = all_mists_cta.find((item) => item.slug === "three");

	if (!block) {
		throw new Error("Missing preview block for three in all_mists_cta");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}