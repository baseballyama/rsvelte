import * as $ from 'svelte/internal/server';
import { getters } from "$lib/utils/getters.svelte.js";
import { Collapsible as Builder } from "../builders/Collapsible.svelte";

export default function Collapsible($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, children, $$slots, $$events, ...rest } = $$props;

		const collapsible = new Builder({
			open: () => open,
			onOpenChange: (v) => open = v,
			...getters(rest)
		});

		children($$renderer, collapsible);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { open, collapsible });
	});
}