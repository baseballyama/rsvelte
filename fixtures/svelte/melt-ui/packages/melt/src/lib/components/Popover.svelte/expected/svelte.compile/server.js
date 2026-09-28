import * as $ from 'svelte/internal/server';
import { getters } from "../utils/getters.svelte";
import { Popover as Builder } from "../builders/Popover.svelte";

export default function Popover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, children, $$slots, $$events, ...rest } = $$props;

		const popover = new Builder({
			open: () => open,
			onOpenChange: (v) => open = v,
			...getters(rest),
			focus: { ...getters(rest).focus }
		});

		children($$renderer, popover);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { open, popover });
	});
}