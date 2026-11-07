import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { signup } from "$lib/all_blocks/signup";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = signup.find((item) => item.title === "one");

	if (!block) {
		throw new Error("Missing preview block for one in signup");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}