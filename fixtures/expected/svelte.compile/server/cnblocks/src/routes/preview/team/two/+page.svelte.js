import * as $ from 'svelte/internal/server';
import { team } from "$lib/all_blocks/team";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = team.find((item) => item.title === "two");

		if (!block) {
			throw new Error("Missing preview block for two in team");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}