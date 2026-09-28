import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { hero } from "$lib/all_blocks/hero";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = hero.find((item) => item.title === "three");

	if (!block) {
		throw new Error("Missing preview block for three in hero");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}