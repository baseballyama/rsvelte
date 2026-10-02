import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipHideIcon_test($$renderer) {
	Tooltip($$renderer, {
		hideIcon: true,
		triggerText: 'Tooltip trigger',
		iconDescription: 'Information',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This tooltip has its icon hidden`);
		},
		$$slots: { default: true }
	});
}