import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { faq } from "$lib/all_blocks/faq";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = faq.find((item) => item.title === "two");

	if (!block) {
		throw new Error("Missing preview block for two in faq");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}