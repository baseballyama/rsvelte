import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipCustomIcon_test($$renderer) {
	Tooltip($$renderer, {
		iconDescription: 'Information',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom icon tooltip`);
		},

		$$slots: {
			default: true,
			icon: ($$renderer) => {
				$$renderer.push(`<div slot="icon" data-testid="custom-icon">🔍</div>`);
			}
		}
	});
}