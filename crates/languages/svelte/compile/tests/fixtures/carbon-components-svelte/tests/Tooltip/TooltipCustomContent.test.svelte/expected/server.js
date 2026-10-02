import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipCustomContent_test($$renderer) {
	Tooltip($$renderer, {
		open: true,
		iconDescription: 'Information',
		children: ($$renderer) => {
			$$renderer.push(`<p data-testid="tooltip-content">Custom tooltip content</p>`);
		},
		$$slots: { default: true }
	});
}