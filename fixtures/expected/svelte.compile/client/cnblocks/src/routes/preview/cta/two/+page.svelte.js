import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cta } from "$lib/all_blocks/cta";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = cta.find((item) => item.title === "two");

	if (!block) {
		throw new Error("Missing preview block for two in cta");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}