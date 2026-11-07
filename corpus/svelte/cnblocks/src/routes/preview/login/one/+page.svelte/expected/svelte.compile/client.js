import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { login } from "$lib/all_blocks/login";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = login.find((item) => item.title === "one");

	if (!block) {
		throw new Error("Missing preview block for one in login");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}