import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_mists_footer } from "$lib/all_mists/footer";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = all_mists_footer.find((item) => item.slug === "two");

	if (!block) {
		throw new Error("Missing preview block for two in all_mists_footer");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}