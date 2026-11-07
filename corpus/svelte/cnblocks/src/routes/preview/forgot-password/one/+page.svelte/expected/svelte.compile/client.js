import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { forgot_password } from "$lib/all_blocks/forgot-password";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = forgot_password.find((item) => item.title === "one");

	if (!block) {
		throw new Error("Missing preview block for one in forgot_password");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}