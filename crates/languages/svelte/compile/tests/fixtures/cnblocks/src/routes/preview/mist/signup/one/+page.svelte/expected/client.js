import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_mists_signup } from "$lib/all_mists/signup";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = all_mists_signup.find((item) => item.slug === "one");

	if (!block) {
		throw new Error("Missing preview block for one in all_mists_signup");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}