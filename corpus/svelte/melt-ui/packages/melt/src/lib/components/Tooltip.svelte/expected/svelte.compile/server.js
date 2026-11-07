import * as $ from 'svelte/internal/server';
import { Tooltip as Builder } from "$lib/builders";
import { getters } from "$lib/utils/getters.svelte.js";

export default function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, children, $$slots, $$events, ...rest } = $$props;

		const tooltip = new Builder({
			open: () => open,
			onOpenChange: (v) => open = v,
			...getters(rest)
		});

		children($$renderer, tooltip);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { open });
	});
}