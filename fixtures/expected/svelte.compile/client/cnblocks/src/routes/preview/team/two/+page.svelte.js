import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { team } from "$lib/all_blocks/team";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const block = team.find((item) => item.title === "two");

	if (!block) {
		throw new Error("Missing preview block for two in team");
	}

	const PreviewComponent = block.component;

	PreviewComponent($$anchor, {});
	$.pop();
}