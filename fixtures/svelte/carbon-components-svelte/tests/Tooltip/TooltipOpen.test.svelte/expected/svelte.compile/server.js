import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipOpen_test($$renderer) {
	Tooltip($$renderer, {
		open: true,
		iconDescription: 'Information',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This tooltip is initially open`);
		},
		$$slots: { default: true }
	});
}