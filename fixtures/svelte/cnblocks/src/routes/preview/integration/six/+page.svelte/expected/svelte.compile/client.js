import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { integration } from "$lib/all_blocks/integration";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = integration.find((item) => item.title === "six");

	if (!block) {
		throw new Error("Missing preview block for six in integration");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}