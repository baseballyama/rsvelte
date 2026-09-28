import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { content } from "$lib/all_blocks/content";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = content.find((item) => item.title === "four");

	if (!block) {
		throw new Error("Missing preview block for four in content");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}