import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { logocloud } from "$lib/all_blocks/logo-cloud";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = logocloud.find((item) => item.title === "one");

	if (!block) {
		throw new Error("Missing preview block for one in logocloud");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}