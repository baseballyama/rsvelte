import * as $ from 'svelte/internal/server';
import { all_mists_integrations } from "$lib/all_mists/integrations";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = all_mists_integrations.find((item) => item.slug === "two");

		if (!block) {
			throw new Error("Missing preview block for two in all_mists_integrations");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}