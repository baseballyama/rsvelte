import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { footer } from "$lib/all_blocks/footer";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = footer.find((item) => item.title === "four");

	if (!block) {
		throw new Error("Missing preview block for four in footer");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}