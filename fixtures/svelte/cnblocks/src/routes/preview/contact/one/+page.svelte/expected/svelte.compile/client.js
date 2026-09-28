import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { contact } from "$lib/all_blocks/contact";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = contact.find((item) => item.title === "one");

	if (!block) {
		throw new Error("Missing preview block for one in contact");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}